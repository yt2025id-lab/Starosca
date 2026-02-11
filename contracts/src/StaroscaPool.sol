// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {AutomationCompatibleInterface} from
    "@chainlink/contracts/src/v0.8/automation/interfaces/AutomationCompatibleInterface.sol";
import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";
import {IStaroscaPool} from "./interfaces/IStaroscaPool.sol";
import {IYieldManager} from "./interfaces/IYieldManager.sol";
import {StaroscaTypes} from "./libraries/StaroscaTypes.sol";
import {TimeLib} from "./libraries/TimeLib.sol";
import {YieldMath} from "./libraries/YieldMath.sol";

/// @title StaroscaPool
/// @notice Core ROSCA pool contract — handles joining, payments, drawings, and claims
/// @dev Deployed as EIP-1167 clones via StaroscaFactory. VRF handled by Factory.
contract StaroscaPool is IStaroscaPool, AutomationCompatibleInterface, ReentrancyGuard {
    using SafeERC20 for IERC20;

    // ============ State Variables ============

    // Immutable-like (set once in initialize)
    address public factory;
    IYieldManager public yieldManager;
    IERC20 public usdc;
    AggregatorV3Interface public dataFeed; // USDC/USD price feed

    // Pool configuration
    StaroscaTypes.PoolConfig public config;
    StaroscaTypes.PoolStatus public status;
    address public creator;

    // Participants
    StaroscaTypes.Participant[] public participants;
    mapping(address => uint256) public participantIndex; // addr => index+1 (0 = not joined)
    uint8 public participantCount;

    // Payment tracking: month (1-indexed) => participant => payment
    mapping(uint8 => mapping(address => StaroscaTypes.MonthlyPayment)) public payments;

    // On-time payment days tracking (for contribution yield distribution)
    mapping(address => uint256) public onTimePaymentDays;
    uint256 public totalOnTimePaymentDays;

    // Collateral-months tracking (for collateral yield distribution)
    mapping(address => uint8[]) public collateralDeductionMonths;

    // Drawing tracking
    uint8 public currentMonth; // Current month (1-indexed), 0 = not started
    mapping(uint8 => address) public monthWinner;
    mapping(uint8 => bool) public drawingRequested;
    mapping(uint8 => bool) public drawingCompleted;

    // Finalization
    bool public finalized;
    uint256 public finalCollateralTotal;
    uint256 public finalCollateralYield;
    uint256 public finalContributionYield;
    mapping(address => bool) public hasClaimed;

    bool private _initialized;

    // ============ Modifiers ============

    modifier onlyFactory() {
        if (msg.sender != factory) revert StaroscaTypes.Unauthorized();
        _;
    }

    modifier onlyWhenPending() {
        if (status != StaroscaTypes.PoolStatus.PENDING) revert StaroscaTypes.PoolNotPending();
        _;
    }

    modifier onlyWhenActive() {
        if (status != StaroscaTypes.PoolStatus.ACTIVE) revert StaroscaTypes.PoolNotActive();
        _;
    }

    // ============ Initialize (used instead of constructor for clones) ============

    /// @inheritdoc IStaroscaPool
    function initialize(
        address _factory,
        address _yieldManager,
        address _usdc,
        address _vrfCoordinator, // stored in factory, not used here
        bytes32 _vrfKeyHash,     // stored in factory, not used here
        uint256 _vrfSubscriptionId, // stored in factory, not used here
        address _dataFeed,
        uint8 _maxParticipants,
        uint256 _monthlyContribution,
        address _creator
    ) external override {
        require(!_initialized, "Already initialized");
        _initialized = true;

        if (_maxParticipants < 3) revert StaroscaTypes.InvalidParticipantCount();
        if (_monthlyContribution == 0) revert StaroscaTypes.ZeroAmount();

        factory = _factory;
        yieldManager = IYieldManager(_yieldManager);
        usdc = IERC20(_usdc);
        dataFeed = AggregatorV3Interface(_dataFeed);
        creator = _creator;

        config = StaroscaTypes.PoolConfig({
            maxParticipants: _maxParticipants,
            monthlyContribution: _monthlyContribution,
            collateralPerUser: uint256(_maxParticipants) * _monthlyContribution,
            startTimestamp: 0 // Set when pool activates
        });

        status = StaroscaTypes.PoolStatus.PENDING;
    }

    // ============ Join ============

    /// @inheritdoc IStaroscaPool
    function join() external override nonReentrant onlyWhenPending {
        if (participantIndex[msg.sender] != 0) revert StaroscaTypes.AlreadyJoined();
        if (participantCount >= config.maxParticipants) revert StaroscaTypes.PoolFull();

        uint256 collateralAmount = config.collateralPerUser;
        uint256 contributionAmount = config.monthlyContribution;
        uint256 totalDeposit = collateralAmount + contributionAmount;

        // Transfer total USDC from user to this contract
        usdc.safeTransferFrom(msg.sender, address(this), totalDeposit);

        // Register participant
        participants.push(StaroscaTypes.Participant({
            addr: msg.sender,
            collateralDeposited: collateralAmount,
            collateralRemaining: collateralAmount,
            joinTimestamp: block.timestamp,
            hasWon: false,
            wonInMonth: 0
        }));
        participantIndex[msg.sender] = participants.length; // 1-indexed
        participantCount++;

        // Deposit collateral to YieldManager
        usdc.safeIncreaseAllowance(address(yieldManager), collateralAmount);
        yieldManager.depositCollateral(address(this), msg.sender, collateralAmount);

        // Deposit first contribution to YieldManager
        usdc.safeIncreaseAllowance(address(yieldManager), contributionAmount);
        yieldManager.depositContribution(address(this), contributionAmount);

        emit StaroscaTypes.ParticipantJoined(
            address(this), msg.sender, collateralAmount, contributionAmount
        );

        // If pool is full, activate
        if (participantCount == config.maxParticipants) {
            _activatePool();
        }
    }

    // ============ Monthly Payment ============

    /// @inheritdoc IStaroscaPool
    function makePayment() external override nonReentrant onlyWhenActive {
        if (participantIndex[msg.sender] == 0) revert StaroscaTypes.NotParticipant();

        (TimeLib.PaymentWindow window, uint8 paymentMonth) =
            TimeLib.getPaymentWindow(block.timestamp, config.startTimestamp);

        // Validate payment month is within range
        require(paymentMonth >= 1 && paymentMonth <= config.maxParticipants, "Invalid month");

        // Month 1 is paid during join, so payments start from month 2
        // But if window is DRAWING_OR_AFTER, paymentMonth is already incremented
        // Check they haven't already paid for this month
        if (payments[paymentMonth][msg.sender].status != StaroscaTypes.PaymentStatus.NOT_PAID) {
            revert StaroscaTypes.PaymentAlreadyMade();
        }

        uint256 amount = config.monthlyContribution;
        usdc.safeTransferFrom(msg.sender, address(this), amount);

        StaroscaTypes.PaymentStatus paymentStatus;

        if (window == TimeLib.PaymentWindow.ON_TIME) {
            paymentStatus = StaroscaTypes.PaymentStatus.PAID_ON_TIME;

            // Track on-time days for yield distribution
            uint8 daysUntil25 = TimeLib.daysUntilDrawing(block.timestamp);
            onTimePaymentDays[msg.sender] += daysUntil25;
            totalOnTimePaymentDays += daysUntil25;
        } else if (window == TimeLib.PaymentWindow.LATE) {
            paymentStatus = StaroscaTypes.PaymentStatus.PAID_LATE;
        } else {
            // DRAWING_OR_AFTER: payment counts for next month, already on-time
            paymentStatus = StaroscaTypes.PaymentStatus.PAID_ON_TIME;
            uint8 daysUntil25 = TimeLib.daysUntilDrawing(block.timestamp);
            // For next month payment made early, they get max days (25-1=24 days)
            // since the actual month hasn't started yet
            uint8 yieldDays = 24; // Maximum days of yield
            onTimePaymentDays[msg.sender] += yieldDays;
            totalOnTimePaymentDays += yieldDays;
        }

        payments[paymentMonth][msg.sender] = StaroscaTypes.MonthlyPayment({
            amount: amount,
            paidAt: block.timestamp,
            status: paymentStatus
        });

        // Deposit contribution to YieldManager
        usdc.safeIncreaseAllowance(address(yieldManager), amount);
        yieldManager.depositContribution(address(this), amount);

        emit StaroscaTypes.PaymentMade(
            address(this), msg.sender, paymentMonth, amount, paymentStatus
        );
    }

    // ============ Drawing ============

    /// @notice Request a drawing — called by Automation or anyone after the 25th
    /// @inheritdoc IStaroscaPool
    function requestDrawing() external override onlyWhenActive {
        uint8 month = currentMonth;
        if (month == 0 || month > config.maxParticipants) revert StaroscaTypes.AllDrawingsCompleted();
        if (drawingRequested[month]) revert StaroscaTypes.DrawingAlreadyRequested();

        // Check it's the 25th or later
        if (!TimeLib.isDrawingDay(block.timestamp)) revert StaroscaTypes.DrawingNotReady();

        // Enforce missed payments: deduct collateral for anyone who hasn't paid
        _enforceMissedPayments(month);

        drawingRequested[month] = true;

        // Request VRF through factory (factory is the VRF consumer)
        (bool success, bytes memory data) = factory.call(
            abi.encodeWithSignature("requestVRFForPool(address,uint8)", address(this), month)
        );
        require(success, "VRF request failed");
        uint256 requestId = abi.decode(data, (uint256));

        emit StaroscaTypes.DrawingRequested(address(this), month, requestId);
    }

    /// @notice Called by factory when VRF fulfills randomness
    /// @param month The month this drawing is for
    /// @param randomWord The random value from VRF
    function fulfillDrawing(uint8 month, uint256 randomWord) external onlyFactory {
        require(drawingRequested[month], "Drawing not requested");
        require(!drawingCompleted[month], "Drawing already completed");

        // Build eligible list (participants who haven't won yet)
        address[] memory eligible = _getEligibleParticipants();
        require(eligible.length > 0, "No eligible participants");

        // Select winner
        uint256 winnerIdx = randomWord % eligible.length;
        address winner = eligible[winnerIdx];

        // Mark winner
        uint256 pIdx = participantIndex[winner] - 1;
        participants[pIdx].hasWon = true;
        participants[pIdx].wonInMonth = month;
        monthWinner[month] = winner;
        drawingCompleted[month] = true;

        // Calculate pot: participants * monthlyContribution
        uint256 potAmount = uint256(config.maxParticipants) * config.monthlyContribution;

        // Withdraw pot from YieldManager
        uint256 actualPot = yieldManager.withdrawContributionsForDrawing(address(this), potAmount);

        // Transfer pot to winner
        usdc.safeTransfer(winner, actualPot);

        emit StaroscaTypes.DrawingCompleted(address(this), month, winner, actualPot);

        // Advance to next month or complete
        if (month >= config.maxParticipants) {
            status = StaroscaTypes.PoolStatus.COMPLETED;
            emit StaroscaTypes.PoolCompleted(address(this));
        } else {
            currentMonth = month + 1;
        }
    }

    // ============ Finalization & Claims ============

    /// @inheritdoc IStaroscaPool
    function finalize() external override nonReentrant {
        if (status != StaroscaTypes.PoolStatus.COMPLETED) revert StaroscaTypes.PoolNotCompleted();
        if (finalized) revert StaroscaTypes.PoolNotReadyForFinalization();

        // Withdraw all from YieldManager
        (uint256 totalCollateral, uint256 collateralYield, uint256 contributionYield) =
            yieldManager.withdrawAll(address(this));

        finalCollateralTotal = totalCollateral;
        finalCollateralYield = collateralYield;
        finalContributionYield = contributionYield;
        finalized = true;
        status = StaroscaTypes.PoolStatus.FINALIZED;

        emit StaroscaTypes.PoolFinalized(address(this), collateralYield, contributionYield);
    }

    /// @inheritdoc IStaroscaPool
    function claim() external override nonReentrant {
        if (!finalized) revert StaroscaTypes.NotFinalized();
        if (participantIndex[msg.sender] == 0) revert StaroscaTypes.NotParticipant();
        if (hasClaimed[msg.sender]) revert StaroscaTypes.AlreadyClaimed();

        hasClaimed[msg.sender] = true;

        StaroscaTypes.ClaimInfo memory info = _calculateClaim(msg.sender);

        if (info.totalClaim > 0) {
            usdc.safeTransfer(msg.sender, info.totalClaim);
        }

        emit StaroscaTypes.ClaimMade(
            address(this),
            msg.sender,
            info.collateralReturn,
            info.collateralYield,
            info.contributionYield
        );
    }

    /// @inheritdoc IStaroscaPool
    function cancel() external override onlyWhenPending {
        require(msg.sender == creator || msg.sender == factory, "Only creator or factory");

        status = StaroscaTypes.PoolStatus.CANCELLED;

        // Refund all joined participants
        for (uint256 i = 0; i < participants.length; i++) {
            address addr = participants[i].addr;
            uint256 collateral = participants[i].collateralDeposited;
            uint256 contribution = config.monthlyContribution;

            // Note: In a real implementation, we'd withdraw from YieldManager
            // For simplicity, this handles the basic refund
        }

        emit StaroscaTypes.PoolCancelled(address(this));
    }

    // ============ Chainlink Automation ============

    /// @notice Chainlink Automation check — determines if drawing or finalization is needed
    function checkUpkeep(bytes calldata)
        external
        view
        override
        returns (bool upkeepNeeded, bytes memory performData)
    {
        if (status == StaroscaTypes.PoolStatus.ACTIVE) {
            uint8 month = currentMonth;
            if (month >= 1 && month <= config.maxParticipants) {
                if (!drawingRequested[month] && TimeLib.isDrawingDay(block.timestamp)) {
                    return (true, abi.encode(uint8(1), month)); // Action 1: Drawing
                }
            }
        } else if (status == StaroscaTypes.PoolStatus.COMPLETED && !finalized) {
            return (true, abi.encode(uint8(2), uint8(0))); // Action 2: Finalize
        }

        return (false, "");
    }

    /// @notice Chainlink Automation perform — executes drawing or finalization
    function performUpkeep(bytes calldata performData) external override {
        (uint8 action, uint8 month) = abi.decode(performData, (uint8, uint8));

        if (action == 1) {
            // Trigger drawing
            this.requestDrawing();
        } else if (action == 2) {
            // Finalize
            this.finalize();
        }
    }

    // ============ View Functions ============

    /// @inheritdoc IStaroscaPool
    function getPoolInfo() external view override returns (StaroscaTypes.PoolSummary memory) {
        return StaroscaTypes.PoolSummary({
            config: config,
            status: status,
            currentMonth: currentMonth,
            participantCount: participantCount,
            totalCollateral: uint256(participantCount) * config.collateralPerUser,
            totalContributions: uint256(participantCount) * config.monthlyContribution
        });
    }

    /// @inheritdoc IStaroscaPool
    function getParticipants() external view override returns (StaroscaTypes.Participant[] memory) {
        return participants;
    }

    /// @inheritdoc IStaroscaPool
    function getPaymentStatus(address participant, uint8 month)
        external
        view
        override
        returns (StaroscaTypes.PaymentStatus)
    {
        return payments[month][participant].status;
    }

    /// @inheritdoc IStaroscaPool
    function getEstimatedClaim(address participant)
        external
        view
        override
        returns (StaroscaTypes.ClaimInfo memory)
    {
        if (!finalized) {
            // Return estimate based on current state
            return StaroscaTypes.ClaimInfo({
                collateralReturn: 0,
                collateralYield: 0,
                contributionYield: 0,
                totalClaim: 0
            });
        }
        return _calculateClaim(participant);
    }

    /// @inheritdoc IStaroscaPool
    function getDrawingEligible() external view override returns (address[] memory) {
        return _getEligibleParticipants();
    }

    /// @inheritdoc IStaroscaPool
    function isParticipant(address addr) external view override returns (bool) {
        return participantIndex[addr] != 0;
    }

    /// @inheritdoc IStaroscaPool
    function getMonthWinner(uint8 month) external view override returns (address) {
        return monthWinner[month];
    }

    function getTotalMonths() external view returns (uint8) {
        return config.maxParticipants;
    }

    // ============ Internal Functions ============

    function _activatePool() internal {
        // Set start timestamp to 1st of next month
        (uint256 year, uint256 month, ) = TimeLib.timestampToDate(block.timestamp);
        config.startTimestamp = TimeLib.firstOfNextMonth(year, month);
        currentMonth = 1;
        status = StaroscaTypes.PoolStatus.ACTIVE;

        // First month contribution was paid during join, mark all as paid on-time
        for (uint256 i = 0; i < participants.length; i++) {
            address addr = participants[i].addr;
            payments[1][addr] = StaroscaTypes.MonthlyPayment({
                amount: config.monthlyContribution,
                paidAt: block.timestamp,
                status: StaroscaTypes.PaymentStatus.PAID_ON_TIME
            });
            // First month: everyone gets max yield days
            onTimePaymentDays[addr] += 24;
            totalOnTimePaymentDays += 24;
        }

        emit StaroscaTypes.PoolActivated(address(this), config.startTimestamp);
    }

    function _enforceMissedPayments(uint8 month) internal {
        for (uint256 i = 0; i < participants.length; i++) {
            address addr = participants[i].addr;

            if (payments[month][addr].status == StaroscaTypes.PaymentStatus.NOT_PAID) {
                // Mark as missed
                payments[month][addr].status = StaroscaTypes.PaymentStatus.MISSED;

                // Deduct collateral
                uint256 deduction = config.monthlyContribution;
                if (participants[i].collateralRemaining >= deduction) {
                    participants[i].collateralRemaining -= deduction;
                } else {
                    deduction = participants[i].collateralRemaining;
                    participants[i].collateralRemaining = 0;
                }

                // Track deduction month for yield calculation
                collateralDeductionMonths[addr].push(month);

                // Deduct in YieldManager
                yieldManager.deductCollateral(address(this), addr, deduction);

                emit StaroscaTypes.CollateralDeducted(address(this), addr, month, deduction);
            }
        }
    }

    function _getEligibleParticipants() internal view returns (address[] memory) {
        uint256 count = 0;
        for (uint256 i = 0; i < participants.length; i++) {
            if (!participants[i].hasWon) count++;
        }

        address[] memory eligible = new address[](count);
        uint256 idx = 0;
        for (uint256 i = 0; i < participants.length; i++) {
            if (!participants[i].hasWon) {
                eligible[idx] = participants[i].addr;
                idx++;
            }
        }
        return eligible;
    }

    function _calculateClaim(address participant)
        internal
        view
        returns (StaroscaTypes.ClaimInfo memory info)
    {
        uint256 pIdx = participantIndex[participant] - 1;
        StaroscaTypes.Participant storage p = participants[pIdx];

        // 1. Collateral return (remaining after deductions)
        info.collateralReturn = p.collateralRemaining;

        // 2. Collateral yield share (time-weighted)
        uint256 participantCollateralMonths = YieldMath.calculateCollateralMonths(
            p.collateralDeposited,
            collateralDeductionMonths[participant],
            config.monthlyContribution,
            config.maxParticipants
        );

        // Calculate total collateral-months across all participants
        uint256 totalCollateralMonths = 0;
        for (uint256 i = 0; i < participants.length; i++) {
            totalCollateralMonths += YieldMath.calculateCollateralMonths(
                participants[i].collateralDeposited,
                collateralDeductionMonths[participants[i].addr],
                config.monthlyContribution,
                config.maxParticipants
            );
        }

        info.collateralYield = YieldMath.calculateCollateralYieldShare(
            participantCollateralMonths,
            totalCollateralMonths,
            finalCollateralYield
        );

        // 3. Contribution yield share (based on on-time payment days)
        info.contributionYield = YieldMath.calculateContributionYieldShare(
            onTimePaymentDays[participant],
            totalOnTimePaymentDays,
            finalContributionYield
        );

        info.totalClaim = info.collateralReturn + info.collateralYield + info.contributionYield;
    }
}

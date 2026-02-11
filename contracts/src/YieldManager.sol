// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {IYieldManager} from "./interfaces/IYieldManager.sol";
import {IYieldAdapter} from "./interfaces/IYieldAdapter.sol";
import {StaroscaTypes} from "./libraries/StaroscaTypes.sol";

/// @title YieldManager
/// @notice Singleton contract managing yield protocol interactions for all Starosca pools
/// @dev Aggregates deposits across pools, routes to the best yield protocol via adapters
contract YieldManager is IYieldManager, Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    // ============ State Variables ============

    IERC20 public immutable usdcToken;
    address public factory;
    address public optimizer; // AI yield optimizer address (can call rebalance)

    // Adapter management
    address[] public adapters;
    mapping(address => bool) public isAdapter;
    address public override activeAdapter; // Currently active yield adapter

    // Per-pool collateral tracking
    mapping(address => uint256) public poolCollateralPrincipal;
    mapping(address => mapping(address => uint256)) public participantCollateralBalance;

    // Per-pool contribution tracking
    mapping(address => uint256) public poolContributionPrincipal;

    // Total tracking for yield calculation
    uint256 public totalCollateralDeposited;
    uint256 public totalContributionDeposited;

    // ============ Modifiers ============

    modifier onlyPool() {
        if (!_isPool(msg.sender)) revert StaroscaTypes.Unauthorized();
        _;
    }

    modifier onlyOptimizer() {
        if (msg.sender != optimizer && msg.sender != owner()) revert StaroscaTypes.Unauthorized();
        _;
    }

    // ============ Constructor ============

    constructor(address _usdc, address _owner) Ownable(_owner) {
        usdcToken = IERC20(_usdc);
    }

    // ============ Admin Functions ============

    function setFactory(address _factory) external onlyOwner {
        factory = _factory;
    }

    function setOptimizer(address _optimizer) external onlyOwner {
        optimizer = _optimizer;
    }

    function addAdapter(address adapter) external onlyOwner {
        require(!isAdapter[adapter], "Already added");
        adapters.push(adapter);
        isAdapter[adapter] = true;

        // If first adapter, set as active
        if (adapters.length == 1) {
            activeAdapter = adapter;
        }
    }

    function removeAdapter(address adapter) external onlyOwner {
        require(isAdapter[adapter], "Not an adapter");
        require(adapter != activeAdapter, "Cannot remove active adapter");

        isAdapter[adapter] = false;
        for (uint256 i = 0; i < adapters.length; i++) {
            if (adapters[i] == adapter) {
                adapters[i] = adapters[adapters.length - 1];
                adapters.pop();
                break;
            }
        }
    }

    // ============ Pool Deposit Functions ============

    /// @inheritdoc IYieldManager
    function depositCollateral(address pool, address participant, uint256 amount)
        external
        override
        onlyPool
        nonReentrant
    {
        // Transfer USDC from pool to this contract
        usdcToken.safeTransferFrom(msg.sender, address(this), amount);

        // Track per-pool and per-participant
        poolCollateralPrincipal[pool] += amount;
        participantCollateralBalance[pool][participant] += amount;
        totalCollateralDeposited += amount;

        // Deposit to active yield adapter
        if (activeAdapter != address(0)) {
            usdcToken.safeIncreaseAllowance(activeAdapter, amount);
            IYieldAdapter(activeAdapter).deposit(amount);
        }
    }

    /// @inheritdoc IYieldManager
    function depositContribution(address pool, uint256 amount)
        external
        override
        onlyPool
        nonReentrant
    {
        usdcToken.safeTransferFrom(msg.sender, address(this), amount);

        poolContributionPrincipal[pool] += amount;
        totalContributionDeposited += amount;

        if (activeAdapter != address(0)) {
            usdcToken.safeIncreaseAllowance(activeAdapter, amount);
            IYieldAdapter(activeAdapter).deposit(amount);
        }
    }

    // ============ Pool Withdraw Functions ============

    /// @inheritdoc IYieldManager
    function withdrawContributionsForDrawing(address pool, uint256 amount)
        external
        override
        onlyPool
        nonReentrant
        returns (uint256 actualAmount)
    {
        require(poolContributionPrincipal[pool] >= amount, "Insufficient contribution balance");

        if (activeAdapter != address(0)) {
            actualAmount = IYieldAdapter(activeAdapter).withdraw(amount);
        } else {
            actualAmount = amount;
        }

        poolContributionPrincipal[pool] -= amount;
        totalContributionDeposited -= amount;

        // Transfer to the pool for distribution to winner
        usdcToken.safeTransfer(msg.sender, actualAmount);
    }

    /// @inheritdoc IYieldManager
    function deductCollateral(address pool, address participant, uint256 amount)
        external
        override
        onlyPool
        nonReentrant
    {
        uint256 balance = participantCollateralBalance[pool][participant];
        uint256 deduction = amount > balance ? balance : amount;

        participantCollateralBalance[pool][participant] -= deduction;
        poolCollateralPrincipal[pool] -= deduction;
        totalCollateralDeposited -= deduction;

        // The deducted amount stays in the yield protocol (becomes contribution)
        // It covers the missed payment
        poolContributionPrincipal[pool] += deduction;
        totalContributionDeposited += deduction;
    }

    /// @inheritdoc IYieldManager
    function withdrawAll(address pool)
        external
        override
        onlyPool
        nonReentrant
        returns (
            uint256 totalCollateral,
            uint256 collateralYield,
            uint256 contributionYield
        )
    {
        uint256 poolCollateral = poolCollateralPrincipal[pool];
        uint256 poolContribution = poolContributionPrincipal[pool];
        uint256 totalPrincipal = poolCollateral + poolContribution;

        if (totalPrincipal == 0) return (0, 0, 0);

        // Calculate this pool's share of total yield
        uint256 totalBalance;
        if (activeAdapter != address(0)) {
            totalBalance = IYieldAdapter(activeAdapter).getBalance();
        } else {
            totalBalance = usdcToken.balanceOf(address(this));
        }

        uint256 totalPrincipalAll = totalCollateralDeposited + totalContributionDeposited;
        uint256 totalYield = totalBalance > totalPrincipalAll ? totalBalance - totalPrincipalAll : 0;

        // Pool's share of yield (proportional to principal)
        uint256 poolYield = totalPrincipalAll > 0
            ? (totalYield * totalPrincipal) / totalPrincipalAll
            : 0;

        // Split yield between collateral and contribution proportionally
        if (poolYield > 0 && totalPrincipal > 0) {
            collateralYield = (poolYield * poolCollateral) / totalPrincipal;
            contributionYield = poolYield - collateralYield;
        }

        // Withdraw from adapter
        uint256 withdrawAmount = totalPrincipal + poolYield;
        uint256 actualWithdrawn;
        if (activeAdapter != address(0)) {
            actualWithdrawn = IYieldAdapter(activeAdapter).withdraw(withdrawAmount);
        } else {
            actualWithdrawn = withdrawAmount;
        }

        // Update accounting
        totalCollateralDeposited -= poolCollateral;
        totalContributionDeposited -= poolContribution;
        poolCollateralPrincipal[pool] = 0;
        poolContributionPrincipal[pool] = 0;

        totalCollateral = poolCollateral;

        // Transfer everything to the pool
        usdcToken.safeTransfer(msg.sender, actualWithdrawn);
    }

    // ============ Optimizer Functions ============

    /// @inheritdoc IYieldManager
    function rebalance(address fromAdapter, address toAdapter)
        external
        override
        onlyOptimizer
        nonReentrant
    {
        require(isAdapter[fromAdapter], "Invalid from adapter");
        require(isAdapter[toAdapter], "Invalid to adapter");
        require(fromAdapter != toAdapter, "Same adapter");
        require(fromAdapter == activeAdapter, "From adapter not active");

        // Withdraw all from current adapter
        uint256 withdrawn = IYieldAdapter(fromAdapter).withdrawAll();

        // Deposit all to new adapter
        usdcToken.safeIncreaseAllowance(toAdapter, withdrawn);
        IYieldAdapter(toAdapter).deposit(withdrawn);

        // Update active adapter
        activeAdapter = toAdapter;
    }

    // ============ View Functions ============

    /// @inheritdoc IYieldManager
    function getAccruedYield(address pool)
        external
        view
        override
        returns (uint256 collateralYield, uint256 contributionYield)
    {
        uint256 poolCollateral = poolCollateralPrincipal[pool];
        uint256 poolContribution = poolContributionPrincipal[pool];
        uint256 totalPrincipal = poolCollateral + poolContribution;

        if (totalPrincipal == 0) return (0, 0);

        uint256 totalBalance;
        if (activeAdapter != address(0)) {
            totalBalance = IYieldAdapter(activeAdapter).getBalance();
        } else {
            totalBalance = usdcToken.balanceOf(address(this));
        }

        uint256 totalPrincipalAll = totalCollateralDeposited + totalContributionDeposited;
        uint256 totalYield = totalBalance > totalPrincipalAll ? totalBalance - totalPrincipalAll : 0;

        uint256 poolYield = totalPrincipalAll > 0
            ? (totalYield * totalPrincipal) / totalPrincipalAll
            : 0;

        if (poolYield > 0 && totalPrincipal > 0) {
            collateralYield = (poolYield * poolCollateral) / totalPrincipal;
            contributionYield = poolYield - collateralYield;
        }
    }

    /// @inheritdoc IYieldManager
    function getParticipantCollateral(address pool, address participant)
        external
        view
        override
        returns (uint256)
    {
        return participantCollateralBalance[pool][participant];
    }

    function getAdapters() external view returns (address[] memory) {
        return adapters;
    }

    function getAdapterCount() external view returns (uint256) {
        return adapters.length;
    }

    // ============ Internal ============

    function _isPool(address addr) internal view returns (bool) {
        // Check with factory if the address is a valid pool
        // For now, we use a simple interface call
        (bool success, bytes memory data) = factory.staticcall(
            abi.encodeWithSignature("isPool(address)", addr)
        );
        return success && abi.decode(data, (bool));
    }
}

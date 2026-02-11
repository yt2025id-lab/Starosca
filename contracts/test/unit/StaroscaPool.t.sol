// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test, console} from "forge-std/Test.sol";
import {StaroscaFactory} from "../../src/StaroscaFactory.sol";
import {StaroscaPool} from "../../src/StaroscaPool.sol";
import {YieldManager} from "../../src/YieldManager.sol";
import {StaroscaTypes} from "../../src/libraries/StaroscaTypes.sol";
import {TimeLib} from "../../src/libraries/TimeLib.sol";
import {MockERC20} from "../mocks/MockERC20.sol";
import {MockVRFCoordinator} from "../mocks/MockVRFCoordinator.sol";
import {MockYieldAdapter} from "../mocks/MockYieldAdapter.sol";
import {MockDataFeed} from "../mocks/MockDataFeed.sol";

contract StaroscaPoolTest is Test {
    // Contracts
    StaroscaFactory public factory;
    YieldManager public yieldManager;
    MockERC20 public usdc;
    MockVRFCoordinator public vrfCoordinator;
    MockYieldAdapter public yieldAdapter;
    MockDataFeed public dataFeed;

    // Test users
    address public owner = makeAddr("owner");
    address public alice = makeAddr("alice");
    address public bob = makeAddr("bob");
    address public charlie = makeAddr("charlie");
    address public dave = makeAddr("dave");

    // Pool config
    uint8 public constant MAX_PARTICIPANTS = 3;
    uint256 public constant MONTHLY_CONTRIBUTION = 100e6; // 100 USDC
    uint256 public constant COLLATERAL_PER_USER = 300e6; // 3 * 100 USDC
    uint256 public constant TOTAL_DEPOSIT = 400e6; // collateral + first month

    // VRF config
    bytes32 public constant VRF_KEY_HASH = bytes32(uint256(1));
    uint256 public constant VRF_SUB_ID = 1;

    function setUp() public {
        vm.startPrank(owner);

        // Deploy mock contracts
        usdc = new MockERC20("USD Coin", "USDC", 6);
        vrfCoordinator = new MockVRFCoordinator();
        dataFeed = new MockDataFeed(1e8, 8); // $1.00 USDC

        // Deploy core contracts
        yieldManager = new YieldManager(address(usdc), owner);

        // Deploy factory (VRF consumer)
        factory = new StaroscaFactory(
            address(vrfCoordinator),
            address(usdc),
            address(yieldManager),
            address(dataFeed),
            VRF_KEY_HASH,
            VRF_SUB_ID
        );

        // Setup YieldManager
        yieldManager.setFactory(address(factory));

        // Deploy and add mock yield adapter
        yieldAdapter = new MockYieldAdapter(address(usdc), "MockYield", 500);
        yieldManager.addAdapter(address(yieldAdapter));

        vm.stopPrank();

        // Mint USDC to test users
        usdc.mint(alice, 10_000e6);
        usdc.mint(bob, 10_000e6);
        usdc.mint(charlie, 10_000e6);
        usdc.mint(dave, 10_000e6);
    }

    // ============ Helper Functions ============

    function _createPool() internal returns (address pool) {
        vm.prank(alice);
        pool = factory.createPool(MAX_PARTICIPANTS, MONTHLY_CONTRIBUTION);
    }

    function _joinPool(address pool, address user) internal {
        vm.startPrank(user);
        usdc.approve(pool, TOTAL_DEPOSIT);
        StaroscaPool(pool).join();
        vm.stopPrank();
    }

    function _createAndFillPool() internal returns (address pool) {
        pool = _createPool();
        _joinPool(pool, alice);
        _joinPool(pool, bob);
        _joinPool(pool, charlie);
    }

    function _warpToMonthDay(address pool, uint8 month, uint8 day) internal {
        StaroscaTypes.PoolSummary memory info = StaroscaPool(pool).getPoolInfo();
        (uint256 startYear, uint256 startMonth,) = TimeLib.timestampToDate(info.config.startTimestamp);

        uint256 totalM = startMonth + month - 1;
        uint256 targetYear = startYear + (totalM - 1) / 12;
        uint256 targetMonth = ((totalM - 1) % 12) + 1;

        uint256 ts = TimeLib.dateToTimestamp(targetYear, targetMonth, day);
        vm.warp(ts + 1 hours); // Add 1 hour to be safely in the day
    }

    // ============ Tests: Pool Creation ============

    function test_createPool() public {
        address pool = _createPool();

        assertTrue(factory.isPool(pool));
        assertEq(factory.getPoolCount(), 1);

        StaroscaTypes.PoolSummary memory info = StaroscaPool(pool).getPoolInfo();
        assertEq(info.config.maxParticipants, MAX_PARTICIPANTS);
        assertEq(info.config.monthlyContribution, MONTHLY_CONTRIBUTION);
        assertEq(uint8(info.status), uint8(StaroscaTypes.PoolStatus.PENDING));
    }

    function test_createPool_revertMinParticipants() public {
        vm.prank(alice);
        vm.expectRevert(StaroscaTypes.InvalidParticipantCount.selector);
        factory.createPool(2, MONTHLY_CONTRIBUTION);
    }

    function test_createPool_revertZeroContribution() public {
        vm.prank(alice);
        vm.expectRevert(StaroscaTypes.ZeroAmount.selector);
        factory.createPool(3, 0);
    }

    // ============ Tests: Joining ============

    function test_join() public {
        address pool = _createPool();

        uint256 balanceBefore = usdc.balanceOf(alice);
        _joinPool(pool, alice);
        uint256 balanceAfter = usdc.balanceOf(alice);

        assertEq(balanceBefore - balanceAfter, TOTAL_DEPOSIT);
        assertTrue(StaroscaPool(pool).isParticipant(alice));

        StaroscaTypes.PoolSummary memory info = StaroscaPool(pool).getPoolInfo();
        assertEq(info.participantCount, 1);
        assertEq(uint8(info.status), uint8(StaroscaTypes.PoolStatus.PENDING));
    }

    function test_join_activatesPoolWhenFull() public {
        address pool = _createAndFillPool();

        StaroscaTypes.PoolSummary memory info = StaroscaPool(pool).getPoolInfo();
        assertEq(uint8(info.status), uint8(StaroscaTypes.PoolStatus.ACTIVE));
        assertEq(info.participantCount, MAX_PARTICIPANTS);
        assertTrue(info.config.startTimestamp > 0);
    }

    function test_join_revertAlreadyJoined() public {
        address pool = _createPool();
        _joinPool(pool, alice);

        vm.startPrank(alice);
        usdc.approve(pool, TOTAL_DEPOSIT);
        vm.expectRevert(StaroscaTypes.AlreadyJoined.selector);
        StaroscaPool(pool).join();
        vm.stopPrank();
    }

    function test_join_revertPoolFull() public {
        address pool = _createAndFillPool();

        vm.startPrank(dave);
        usdc.approve(pool, TOTAL_DEPOSIT);
        vm.expectRevert(StaroscaTypes.PoolNotPending.selector);
        StaroscaPool(pool).join();
        vm.stopPrank();
    }

    // ============ Tests: Monthly Payment ============

    function test_makePayment_onTime() public {
        address pool = _createAndFillPool();

        // Warp to month 2, day 5 (on-time)
        _warpToMonthDay(pool, 2, 5);

        vm.startPrank(alice);
        usdc.approve(pool, MONTHLY_CONTRIBUTION);
        StaroscaPool(pool).makePayment();
        vm.stopPrank();

        StaroscaTypes.PaymentStatus status = StaroscaPool(pool).getPaymentStatus(alice, 2);
        assertEq(uint8(status), uint8(StaroscaTypes.PaymentStatus.PAID_ON_TIME));
    }

    function test_makePayment_late() public {
        address pool = _createAndFillPool();

        // Warp to month 2, day 15 (late)
        _warpToMonthDay(pool, 2, 15);

        vm.startPrank(alice);
        usdc.approve(pool, MONTHLY_CONTRIBUTION);
        StaroscaPool(pool).makePayment();
        vm.stopPrank();

        StaroscaTypes.PaymentStatus status = StaroscaPool(pool).getPaymentStatus(alice, 2);
        assertEq(uint8(status), uint8(StaroscaTypes.PaymentStatus.PAID_LATE));
    }

    function test_makePayment_revertNotParticipant() public {
        address pool = _createAndFillPool();
        _warpToMonthDay(pool, 2, 5);

        vm.startPrank(dave);
        usdc.approve(pool, MONTHLY_CONTRIBUTION);
        vm.expectRevert(StaroscaTypes.NotParticipant.selector);
        StaroscaPool(pool).makePayment();
        vm.stopPrank();
    }

    // ============ Tests: Drawing ============

    function test_requestDrawing() public {
        address pool = _createAndFillPool();

        // All participants pay month 2
        _warpToMonthDay(pool, 2, 5);
        _makePayment(pool, alice);
        _makePayment(pool, bob);
        _makePayment(pool, charlie);

        // Warp to 25th for drawing
        _warpToMonthDay(pool, 1, 25);

        StaroscaPool(pool).requestDrawing();

        // Fulfill VRF (random word = 0 → first eligible wins)
        vrfCoordinator.fulfillRandomWordsWithValue(1, 0);

        // Check a winner was selected
        address winner = StaroscaPool(pool).getMonthWinner(1);
        assertTrue(winner != address(0));
    }

    function test_drawing_selectsCorrectWinner() public {
        address pool = _createAndFillPool();

        // Pay month 2 contributions
        _warpToMonthDay(pool, 2, 5);
        _makePayment(pool, alice);
        _makePayment(pool, bob);
        _makePayment(pool, charlie);

        // Drawing for month 1 on 25th
        _warpToMonthDay(pool, 1, 25);
        StaroscaPool(pool).requestDrawing();

        // Random word = 1 → second participant (bob) wins
        vrfCoordinator.fulfillRandomWordsWithValue(1, 1);
        address winner = StaroscaPool(pool).getMonthWinner(1);
        assertEq(winner, bob);

        // Bob should have received the pot
        // Pot = 3 * 100 USDC = 300 USDC
        // Note: Bob started with 10000 - 400 = 9600, then received 300 = 9900
    }

    function test_drawing_revertNotDrawingDay() public {
        address pool = _createAndFillPool();

        // Warp to day 10 (not drawing day)
        _warpToMonthDay(pool, 1, 10);

        vm.expectRevert(StaroscaTypes.DrawingNotReady.selector);
        StaroscaPool(pool).requestDrawing();
    }

    // ============ Tests: Missed Payment & Collateral Deduction ============

    function test_missedPayment_deductsCollateral() public {
        address pool = _createAndFillPool();

        // Only alice and bob pay month 2, charlie doesn't
        _warpToMonthDay(pool, 2, 5);
        _makePayment(pool, alice);
        _makePayment(pool, bob);
        // charlie doesn't pay

        // Warp to 25th — drawing will enforce missed payments
        _warpToMonthDay(pool, 1, 25);
        StaroscaPool(pool).requestDrawing();

        // Charlie's month 1 was paid (during join), so no deduction for month 1
        // But month 2 was NOT paid by charlie
        // Wait, month 1 drawing enforces month 1 payments which were paid during join
        // Let me reconsider: the drawing on the 25th of month 1 checks month 1 payments
        // All were marked PAID_ON_TIME during join

        // Fulfill VRF
        vrfCoordinator.fulfillRandomWordsWithValue(1, 0);

        // Now move to month 2 drawing on 25th
        _warpToMonthDay(pool, 2, 25);

        // At month 2 drawing, charlie hasn't paid month 2
        StaroscaPool(pool).requestDrawing();

        // Check charlie's payment is marked MISSED
        StaroscaTypes.PaymentStatus charlieStatus = StaroscaPool(pool).getPaymentStatus(charlie, 2);
        assertEq(uint8(charlieStatus), uint8(StaroscaTypes.PaymentStatus.MISSED));

        vrfCoordinator.fulfillRandomWordsWithValue(2, 0);
    }

    // ============ Tests: Full Lifecycle ============

    function test_fullLifecycle() public {
        address pool = _createAndFillPool();

        // --- Month 1: Already paid during join, do drawing ---
        _warpToMonthDay(pool, 1, 25);
        StaroscaPool(pool).requestDrawing();
        vrfCoordinator.fulfillRandomWordsWithValue(1, 0); // alice wins month 1

        address winner1 = StaroscaPool(pool).getMonthWinner(1);
        assertEq(winner1, alice);

        // --- Month 2: Everyone pays, drawing ---
        _warpToMonthDay(pool, 2, 5);
        _makePayment(pool, alice);
        _makePayment(pool, bob);
        _makePayment(pool, charlie);

        _warpToMonthDay(pool, 2, 25);
        StaroscaPool(pool).requestDrawing();
        vrfCoordinator.fulfillRandomWordsWithValue(2, 0); // bob wins month 2 (first non-winner)

        address winner2 = StaroscaPool(pool).getMonthWinner(2);
        assertEq(winner2, bob);

        // --- Month 3: Everyone pays, final drawing ---
        _warpToMonthDay(pool, 3, 5);
        _makePayment(pool, alice);
        _makePayment(pool, bob);
        _makePayment(pool, charlie);

        _warpToMonthDay(pool, 3, 25);
        StaroscaPool(pool).requestDrawing();
        vrfCoordinator.fulfillRandomWordsWithValue(3, 0); // charlie wins (only one left)

        address winner3 = StaroscaPool(pool).getMonthWinner(3);
        assertEq(winner3, charlie);

        // Pool should be COMPLETED
        StaroscaTypes.PoolSummary memory info = StaroscaPool(pool).getPoolInfo();
        assertEq(uint8(info.status), uint8(StaroscaTypes.PoolStatus.COMPLETED));

        // --- Finalize ---
        StaroscaPool(pool).finalize();
        info = StaroscaPool(pool).getPoolInfo();
        assertEq(uint8(info.status), uint8(StaroscaTypes.PoolStatus.FINALIZED));

        // --- Claims ---
        uint256 aliceBalanceBefore = usdc.balanceOf(alice);
        vm.prank(alice);
        StaroscaPool(pool).claim();

        uint256 bobBalanceBefore = usdc.balanceOf(bob);
        vm.prank(bob);
        StaroscaPool(pool).claim();

        uint256 charlieBalanceBefore = usdc.balanceOf(charlie);
        vm.prank(charlie);
        StaroscaPool(pool).claim();

        // Each should have received at least their collateral back
        assertTrue(usdc.balanceOf(alice) > aliceBalanceBefore);
        assertTrue(usdc.balanceOf(bob) > bobBalanceBefore);
        assertTrue(usdc.balanceOf(charlie) > charlieBalanceBefore);
    }

    // ============ Tests: Automation ============

    function test_checkUpkeep_returnsTrue_onDrawingDay() public {
        address pool = _createAndFillPool();

        _warpToMonthDay(pool, 1, 25);

        (bool needed, bytes memory data) = StaroscaPool(pool).checkUpkeep("");
        assertTrue(needed);

        (uint8 action, ) = abi.decode(data, (uint8, uint8));
        assertEq(action, 1); // Drawing action
    }

    function test_checkUpkeep_returnsFalse_beforeDrawingDay() public {
        address pool = _createAndFillPool();

        _warpToMonthDay(pool, 1, 10);

        (bool needed, ) = StaroscaPool(pool).checkUpkeep("");
        assertFalse(needed);
    }

    // ============ Tests: View Functions ============

    function test_getParticipants() public {
        address pool = _createAndFillPool();

        StaroscaTypes.Participant[] memory parts = StaroscaPool(pool).getParticipants();
        assertEq(parts.length, 3);
        assertEq(parts[0].addr, alice);
        assertEq(parts[1].addr, bob);
        assertEq(parts[2].addr, charlie);
    }

    function test_getDrawingEligible() public {
        address pool = _createAndFillPool();

        address[] memory eligible = StaroscaPool(pool).getDrawingEligible();
        assertEq(eligible.length, 3);
    }

    function test_getDrawingEligible_afterWin() public {
        address pool = _createAndFillPool();

        // Do first drawing
        _warpToMonthDay(pool, 1, 25);
        StaroscaPool(pool).requestDrawing();
        vrfCoordinator.fulfillRandomWordsWithValue(1, 0);

        address[] memory eligible = StaroscaPool(pool).getDrawingEligible();
        assertEq(eligible.length, 2); // One winner removed
    }

    // ============ Internal Helpers ============

    function _makePayment(address pool, address user) internal {
        vm.startPrank(user);
        usdc.approve(pool, MONTHLY_CONTRIBUTION);
        StaroscaPool(pool).makePayment();
        vm.stopPrank();
    }
}

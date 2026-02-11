// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {StaroscaTypes} from "../libraries/StaroscaTypes.sol";

/// @title IStaroscaPool
/// @notice Interface for Starosca pool instances
interface IStaroscaPool {
    /// @notice Initialize pool (called by factory after clone)
    function initialize(
        address factory,
        address yieldManager,
        address usdc,
        address vrfCoordinator,
        bytes32 vrfKeyHash,
        uint256 vrfSubscriptionId,
        address dataFeed,
        uint8 maxParticipants,
        uint256 monthlyContribution,
        address creator
    ) external;

    /// @notice Join the pool by depositing collateral + first contribution
    function join() external;

    /// @notice Make a monthly contribution payment
    function makePayment() external;

    /// @notice Request a drawing (triggers VRF randomness)
    function requestDrawing() external;

    /// @notice Finalize the pool after all drawings are complete
    function finalize() external;

    /// @notice Claim distribution after finalization
    function claim() external;

    /// @notice Cancel pool if it doesn't fill up
    function cancel() external;

    // ============ View Functions ============

    /// @notice Get pool summary info
    function getPoolInfo() external view returns (StaroscaTypes.PoolSummary memory);

    /// @notice Get all participants
    function getParticipants() external view returns (StaroscaTypes.Participant[] memory);

    /// @notice Get payment status for a participant in a specific month
    function getPaymentStatus(address participant, uint8 month)
        external view returns (StaroscaTypes.PaymentStatus);

    /// @notice Get estimated claim for a participant
    function getEstimatedClaim(address participant)
        external view returns (StaroscaTypes.ClaimInfo memory);

    /// @notice Get eligible participants for next drawing
    function getDrawingEligible() external view returns (address[] memory);

    /// @notice Check if a specific address is a participant
    function isParticipant(address addr) external view returns (bool);

    /// @notice Get the winner of a specific month's drawing
    function getMonthWinner(uint8 month) external view returns (address);
}

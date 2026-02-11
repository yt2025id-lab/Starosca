// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title StaroscaTypes
/// @notice Shared types, errors, and events for the Starosca protocol
library StaroscaTypes {
    // ============ Enums ============

    enum PoolStatus {
        PENDING,    // Waiting for all participants to join
        ACTIVE,     // All slots filled, monthly cycles running
        COMPLETED,  // All drawings done, awaiting finalization
        FINALIZED,  // Yields withdrawn, ready for claims
        CANCELLED   // Pool cancelled (e.g., didn't fill in time)
    }

    enum PaymentStatus {
        NOT_PAID,       // Default — no payment made yet
        PAID_ON_TIME,   // Paid between 1st-10th (eligible for yield)
        PAID_LATE,      // Paid between 11th-24th (no yield)
        MISSED          // Not paid by 25th (collateral deducted)
    }

    // ============ Structs ============

    struct PoolConfig {
        uint8 maxParticipants;        // Total slots (min 3)
        uint256 monthlyContribution;  // USDC amount per month (6 decimals)
        uint256 collateralPerUser;    // maxParticipants * monthlyContribution
        uint256 startTimestamp;       // Set when pool becomes ACTIVE (1st of next month)
    }

    struct Participant {
        address addr;
        uint256 collateralDeposited;   // Original collateral amount
        uint256 collateralRemaining;   // Current collateral (after deductions)
        uint256 joinTimestamp;
        bool hasWon;                   // Has received a drawing pot
        uint8 wonInMonth;              // Month number when they won (1-indexed)
    }

    struct MonthlyPayment {
        uint256 amount;           // Amount paid
        uint256 paidAt;           // Timestamp of payment
        PaymentStatus status;     // Payment status
    }

    struct PoolSummary {
        PoolConfig config;
        PoolStatus status;
        uint8 currentMonth;
        uint8 participantCount;
        uint256 totalCollateral;
        uint256 totalContributions;
    }

    struct ClaimInfo {
        uint256 collateralReturn;     // Remaining collateral
        uint256 collateralYield;      // Yield from collateral staking
        uint256 contributionYield;    // Accumulated yield from monthly contributions
        uint256 totalClaim;           // Sum of all three
    }

    // ============ Errors ============

    error PoolFull();
    error PoolNotPending();
    error PoolNotActive();
    error PoolNotCompleted();
    error PoolNotFinalized();
    error AlreadyJoined();
    error NotParticipant();
    error InsufficientApproval();
    error PaymentAlreadyMade();
    error DrawingNotReady();
    error DrawingAlreadyRequested();
    error AllDrawingsCompleted();
    error AlreadyClaimed();
    error NotFinalized();
    error ZeroAmount();
    error InvalidParticipantCount();
    error Unauthorized();
    error TransferFailed();
    error PoolNotReadyForFinalization();
    error VRFRequestNotFound();

    // ============ Events ============

    event PoolCreated(
        address indexed pool,
        address indexed creator,
        uint8 maxParticipants,
        uint256 monthlyContribution
    );

    event ParticipantJoined(
        address indexed pool,
        address indexed participant,
        uint256 collateral,
        uint256 firstContribution
    );

    event PoolActivated(
        address indexed pool,
        uint256 startTimestamp
    );

    event PaymentMade(
        address indexed pool,
        address indexed participant,
        uint8 month,
        uint256 amount,
        PaymentStatus status
    );

    event DrawingRequested(
        address indexed pool,
        uint8 month,
        uint256 vrfRequestId
    );

    event DrawingCompleted(
        address indexed pool,
        uint8 month,
        address indexed winner,
        uint256 potAmount
    );

    event CollateralDeducted(
        address indexed pool,
        address indexed participant,
        uint8 month,
        uint256 amount
    );

    event PoolCompleted(address indexed pool);

    event PoolFinalized(
        address indexed pool,
        uint256 totalCollateralYield,
        uint256 totalContributionYield
    );

    event ClaimMade(
        address indexed pool,
        address indexed participant,
        uint256 collateralReturn,
        uint256 collateralYield,
        uint256 contributionYield
    );

    event PoolCancelled(address indexed pool);
}

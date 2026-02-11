// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title IYieldManager
/// @notice Interface for the singleton yield manager contract
interface IYieldManager {
    /// @notice Deposit collateral USDC for a participant
    /// @param pool The pool address
    /// @param participant The participant address
    /// @param amount Amount of USDC collateral
    function depositCollateral(address pool, address participant, uint256 amount) external;

    /// @notice Deposit monthly contribution USDC
    /// @param pool The pool address
    /// @param amount Amount of USDC contribution
    function depositContribution(address pool, uint256 amount) external;

    /// @notice Withdraw contributions for monthly drawing pot
    /// @param pool The pool address
    /// @param amount Amount to withdraw for the pot
    /// @return actualAmount Actual amount withdrawn
    function withdrawContributionsForDrawing(address pool, uint256 amount) external returns (uint256 actualAmount);

    /// @notice Deduct collateral for a missed payment
    /// @param pool The pool address
    /// @param participant The participant address
    /// @param amount Amount to deduct from collateral
    function deductCollateral(address pool, address participant, uint256 amount) external;

    /// @notice Withdraw everything at finalization
    /// @param pool The pool address
    /// @return totalCollateral Total collateral principal withdrawn
    /// @return collateralYield Yield earned on collateral
    /// @return contributionYield Yield earned on contributions
    function withdrawAll(address pool) external returns (
        uint256 totalCollateral,
        uint256 collateralYield,
        uint256 contributionYield
    );

    /// @notice Get accrued yield for a pool
    /// @param pool The pool address
    /// @return collateralYield Estimated collateral yield
    /// @return contributionYield Estimated contribution yield
    function getAccruedYield(address pool) external view returns (
        uint256 collateralYield,
        uint256 contributionYield
    );

    /// @notice Get the active adapter address for collateral
    function activeAdapter() external view returns (address);

    /// @notice Rebalance funds from one adapter to another
    /// @param fromAdapter Current adapter address
    /// @param toAdapter Target adapter address
    function rebalance(address fromAdapter, address toAdapter) external;

    /// @notice Get a participant's collateral balance in the manager
    /// @param pool The pool address
    /// @param participant The participant address
    /// @return amount Current collateral balance
    function getParticipantCollateral(address pool, address participant) external view returns (uint256 amount);
}

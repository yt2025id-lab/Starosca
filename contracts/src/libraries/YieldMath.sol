// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title YieldMath
/// @notice Math utilities for yield calculations in Starosca
library YieldMath {
    uint256 constant PRECISION = 1e18;

    /// @notice Calculate a participant's share of collateral yield
    /// @dev Uses time-weighted collateral to determine proportional share
    /// @param participantCollateralMonths Sum of (collateral_remaining * 1) for each month
    /// @param totalCollateralMonths Sum of all participants' collateral-months
    /// @param totalYield Total collateral yield to distribute
    /// @return share Participant's yield share
    function calculateCollateralYieldShare(
        uint256 participantCollateralMonths,
        uint256 totalCollateralMonths,
        uint256 totalYield
    ) internal pure returns (uint256 share) {
        if (totalCollateralMonths == 0) return 0;
        share = (totalYield * participantCollateralMonths) / totalCollateralMonths;
    }

    /// @notice Calculate a participant's share of contribution yield
    /// @dev Based on cumulative on-time payment days (earlier payment = more yield)
    /// @param participantOnTimeDays Total on-time days across all months for this participant
    /// @param totalOnTimeDays Sum of all participants' on-time days
    /// @param totalYield Total contribution yield to distribute
    /// @return share Participant's yield share
    function calculateContributionYieldShare(
        uint256 participantOnTimeDays,
        uint256 totalOnTimeDays,
        uint256 totalYield
    ) internal pure returns (uint256 share) {
        if (totalOnTimeDays == 0) return 0;
        share = (totalYield * participantOnTimeDays) / totalOnTimeDays;
    }

    /// @notice Calculate time-weighted collateral for a participant across all months
    /// @dev For each month, collateral_remaining at that time contributes to the weight
    /// @param collateralDeposited Original collateral
    /// @param deductionMonths Array of months when deductions occurred (1-indexed)
    /// @param deductionAmount Amount deducted per miss (= monthlyContribution)
    /// @param totalMonths Total months the pool ran
    /// @return collateralMonths Sum of collateral-month units
    function calculateCollateralMonths(
        uint256 collateralDeposited,
        uint8[] memory deductionMonths,
        uint256 deductionAmount,
        uint8 totalMonths
    ) internal pure returns (uint256 collateralMonths) {
        uint256 currentCollateral = collateralDeposited;
        uint8 deductionIdx = 0;

        for (uint8 month = 1; month <= totalMonths; month++) {
            // Check if there's a deduction this month
            if (deductionIdx < deductionMonths.length && deductionMonths[deductionIdx] == month) {
                if (currentCollateral >= deductionAmount) {
                    currentCollateral -= deductionAmount;
                } else {
                    currentCollateral = 0;
                }
                deductionIdx++;
            }
            collateralMonths += currentCollateral;
        }
    }
}

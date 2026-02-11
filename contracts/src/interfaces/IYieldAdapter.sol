// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title IYieldAdapter
/// @notice Interface for yield protocol adapters (Aave, Compound, Moonwell, etc.)
interface IYieldAdapter {
    /// @notice Deposit USDC into the yield protocol
    /// @param amount Amount of USDC to deposit
    function deposit(uint256 amount) external;

    /// @notice Withdraw USDC from the yield protocol
    /// @param amount Amount of USDC to withdraw
    /// @return actualAmount The actual amount withdrawn (may differ due to rounding)
    function withdraw(uint256 amount) external returns (uint256 actualAmount);

    /// @notice Withdraw all USDC from the yield protocol
    /// @return actualAmount The total amount withdrawn
    function withdrawAll() external returns (uint256 actualAmount);

    /// @notice Get the current balance (principal + accrued yield) in the protocol
    /// @return balance Current balance in USDC
    function getBalance() external view returns (uint256 balance);

    /// @notice Get the current annual percentage yield
    /// @return apy APY in basis points (10000 = 100%)
    function getAPY() external view returns (uint256 apy);

    /// @notice Get the name of the yield protocol
    /// @return name Protocol name (e.g., "Aave V3", "Compound V3")
    function protocolName() external view returns (string memory name);

    /// @notice Get the USDC token address used by this adapter
    /// @return usdc The USDC address
    function usdc() external view returns (address);
}

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {IYieldAdapter} from "../../src/interfaces/IYieldAdapter.sol";

/// @title MockYieldAdapter
/// @notice Mock yield adapter for testing — simulates yield accrual
contract MockYieldAdapter is IYieldAdapter {
    using SafeERC20 for IERC20;

    IERC20 public immutable usdcToken;
    uint256 private _balance;
    uint256 private _apy; // basis points
    uint256 private _simulatedYield;

    constructor(address _usdc) {
        usdcToken = IERC20(_usdc);
        _apy = 500; // 5% default APY
    }

    function deposit(uint256 amount) external override {
        usdcToken.safeTransferFrom(msg.sender, address(this), amount);
        _balance += amount;
    }

    function withdraw(uint256 amount) external override returns (uint256 actualAmount) {
        actualAmount = amount > _balance + _simulatedYield
            ? _balance + _simulatedYield
            : amount;
        _balance = (_balance + _simulatedYield) - actualAmount;
        _simulatedYield = 0;
        usdcToken.safeTransfer(msg.sender, actualAmount);
    }

    function withdrawAll() external override returns (uint256 actualAmount) {
        actualAmount = _balance + _simulatedYield;
        _balance = 0;
        _simulatedYield = 0;
        usdcToken.safeTransfer(msg.sender, actualAmount);
    }

    function getBalance() external view override returns (uint256) {
        return _balance + _simulatedYield;
    }

    function getAPY() external view override returns (uint256) {
        return _apy;
    }

    function protocolName() external pure override returns (string memory) {
        return "MockYield";
    }

    function usdc() external view override returns (address) {
        return address(usdcToken);
    }

    // ============ Test Helpers ============

    /// @notice Simulate yield accrual (test helper)
    function simulateYield(uint256 yieldAmount) external {
        _simulatedYield += yieldAmount;
        // Mint extra USDC to cover the yield (in tests, MockERC20 would need to mint)
    }

    /// @notice Set APY for testing
    function setAPY(uint256 apy) external {
        _apy = apy;
    }
}

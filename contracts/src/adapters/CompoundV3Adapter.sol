// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {IYieldAdapter} from "../interfaces/IYieldAdapter.sol";

/// @notice Minimal Compound V3 Comet interface
interface IComet {
    function supply(address asset, uint256 amount) external;
    function withdraw(address asset, uint256 amount) external;
    function balanceOf(address account) external view returns (uint256);
    function getSupplyRate(uint256 utilization) external view returns (uint64);
    function getUtilization() external view returns (uint256);
    function baseToken() external view returns (address);
}

/// @title CompoundV3Adapter
/// @notice Yield adapter for Compound V3 (Comet) on Base
/// @dev Compound V3 USDC Comet on Base: 0xb125E6687d4313864e53df431d5425969c15Eb2F
contract CompoundV3Adapter is IYieldAdapter {
    using SafeERC20 for IERC20;

    IERC20 public immutable usdcToken;
    IComet public immutable comet;
    address public immutable yieldManager;

    uint256 private constant SECONDS_PER_YEAR = 365 days;
    uint256 private constant BASE_RATE_SCALE = 1e18;

    modifier onlyYieldManager() {
        require(msg.sender == yieldManager, "Only YieldManager");
        _;
    }

    constructor(address _usdc, address _comet, address _yieldManager) {
        usdcToken = IERC20(_usdc);
        comet = IComet(_comet);
        yieldManager = _yieldManager;
    }

    /// @inheritdoc IYieldAdapter
    function deposit(uint256 amount) external override onlyYieldManager {
        usdcToken.safeTransferFrom(msg.sender, address(this), amount);
        usdcToken.safeIncreaseAllowance(address(comet), amount);
        comet.supply(address(usdcToken), amount);
    }

    /// @inheritdoc IYieldAdapter
    function withdraw(uint256 amount) external override onlyYieldManager returns (uint256 actualAmount) {
        uint256 balance = comet.balanceOf(address(this));
        actualAmount = amount > balance ? balance : amount;
        comet.withdraw(address(usdcToken), actualAmount);
        usdcToken.safeTransfer(msg.sender, actualAmount);
    }

    /// @inheritdoc IYieldAdapter
    function withdrawAll() external override onlyYieldManager returns (uint256 actualAmount) {
        actualAmount = comet.balanceOf(address(this));
        if (actualAmount == 0) return 0;
        comet.withdraw(address(usdcToken), actualAmount);
        usdcToken.safeTransfer(msg.sender, actualAmount);
    }

    /// @inheritdoc IYieldAdapter
    function getBalance() external view override returns (uint256) {
        return comet.balanceOf(address(this));
    }

    /// @inheritdoc IYieldAdapter
    function getAPY() external view override returns (uint256) {
        uint256 utilization = comet.getUtilization();
        uint64 supplyRate = comet.getSupplyRate(utilization);
        // supplyRate is per second, annualize and convert to basis points
        // APY = supplyRate * SECONDS_PER_YEAR / 1e18 * 10000
        return (uint256(supplyRate) * SECONDS_PER_YEAR * 10000) / BASE_RATE_SCALE;
    }

    /// @inheritdoc IYieldAdapter
    function protocolName() external pure override returns (string memory) {
        return "Compound V3";
    }

    /// @inheritdoc IYieldAdapter
    function usdc() external view override returns (address) {
        return address(usdcToken);
    }
}

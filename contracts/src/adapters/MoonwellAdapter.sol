// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {IYieldAdapter} from "../interfaces/IYieldAdapter.sol";

/// @notice Minimal Moonwell mToken interface (Compound-fork style)
interface IMToken {
    function mint(uint256 mintAmount) external returns (uint256);
    function redeem(uint256 redeemTokens) external returns (uint256);
    function redeemUnderlying(uint256 redeemAmount) external returns (uint256);
    function balanceOf(address owner) external view returns (uint256);
    function balanceOfUnderlying(address owner) external returns (uint256);
    function exchangeRateStored() external view returns (uint256);
    function supplyRatePerTimestamp() external view returns (uint256);
    function underlying() external view returns (address);
}

/// @title MoonwellAdapter
/// @notice Yield adapter for Moonwell on Base
/// @dev Moonwell mUSDC on Base: 0xEdc817A28E8B93b03976FBd4a3dDBc9f7D176c22
contract MoonwellAdapter is IYieldAdapter {
    using SafeERC20 for IERC20;

    IERC20 public immutable usdcToken;
    IMToken public immutable mToken;
    address public immutable yieldManager;

    uint256 private constant SECONDS_PER_YEAR = 365 days;
    uint256 private constant EXP_SCALE = 1e18;

    modifier onlyYieldManager() {
        require(msg.sender == yieldManager, "Only YieldManager");
        _;
    }

    constructor(address _usdc, address _mToken, address _yieldManager) {
        usdcToken = IERC20(_usdc);
        mToken = IMToken(_mToken);
        yieldManager = _yieldManager;
    }

    /// @inheritdoc IYieldAdapter
    function deposit(uint256 amount) external override onlyYieldManager {
        usdcToken.safeTransferFrom(msg.sender, address(this), amount);
        usdcToken.safeIncreaseAllowance(address(mToken), amount);
        require(mToken.mint(amount) == 0, "Mint failed");
    }

    /// @inheritdoc IYieldAdapter
    function withdraw(uint256 amount) external override onlyYieldManager returns (uint256 actualAmount) {
        require(mToken.redeemUnderlying(amount) == 0, "Redeem failed");
        actualAmount = amount;
        usdcToken.safeTransfer(msg.sender, actualAmount);
    }

    /// @inheritdoc IYieldAdapter
    function withdrawAll() external override onlyYieldManager returns (uint256 actualAmount) {
        uint256 mTokenBalance = mToken.balanceOf(address(this));
        if (mTokenBalance == 0) return 0;
        require(mToken.redeem(mTokenBalance) == 0, "Redeem failed");
        actualAmount = usdcToken.balanceOf(address(this));
        usdcToken.safeTransfer(msg.sender, actualAmount);
    }

    /// @inheritdoc IYieldAdapter
    function getBalance() external view override returns (uint256) {
        uint256 mTokenBalance = mToken.balanceOf(address(this));
        uint256 exchangeRate = mToken.exchangeRateStored();
        return (mTokenBalance * exchangeRate) / EXP_SCALE;
    }

    /// @inheritdoc IYieldAdapter
    function getAPY() external view override returns (uint256) {
        uint256 ratePerTimestamp = mToken.supplyRatePerTimestamp();
        // Annualize: rate * seconds_per_year, convert to basis points
        return (ratePerTimestamp * SECONDS_PER_YEAR * 10000) / EXP_SCALE;
    }

    /// @inheritdoc IYieldAdapter
    function protocolName() external pure override returns (string memory) {
        return "Moonwell";
    }

    /// @inheritdoc IYieldAdapter
    function usdc() external view override returns (address) {
        return address(usdcToken);
    }
}

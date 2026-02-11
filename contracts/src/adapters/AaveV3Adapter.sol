// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {IYieldAdapter} from "../interfaces/IYieldAdapter.sol";

/// @notice Minimal Aave V3 Pool interface for supply/withdraw
interface IAaveV3Pool {
    function supply(address asset, uint256 amount, address onBehalfOf, uint16 referralCode) external;
    function withdraw(address asset, uint256 amount, address to) external returns (uint256);

    struct ReserveData {
        //stores the reserve configuration
        uint256 configuration;
        //the liquidity index. Expressed in ray
        uint128 liquidityIndex;
        //the current supply rate. Expressed in ray
        uint128 currentLiquidityRate;
        uint128 variableBorrowIndex;
        uint128 currentVariableBorrowRate;
        uint128 currentStableBorrowRate;
        uint40 lastUpdateTimestamp;
        uint16 id;
        address aTokenAddress;
        address stableDebtTokenAddress;
        address variableDebtTokenAddress;
        address interestRateStrategyAddress;
        uint128 accruedToTreasury;
        uint128 unbacked;
        uint128 isolationModeTotalDebt;
    }

    function getReserveData(address asset) external view returns (ReserveData memory);
}

/// @title AaveV3Adapter
/// @notice Yield adapter for Aave V3 on Base
/// @dev Aave V3 Pool on Base: 0xA238Dd80C259a72e81d7e4664a9801593F98d1c5
contract AaveV3Adapter is IYieldAdapter {
    using SafeERC20 for IERC20;

    IERC20 public immutable usdcToken;
    IAaveV3Pool public immutable aavePool;
    IERC20 public immutable aToken; // aUSDC token (balance auto-accrues)
    address public immutable yieldManager;

    uint256 private constant RAY = 1e27;
    uint256 private constant SECONDS_PER_YEAR = 365 days;

    modifier onlyYieldManager() {
        require(msg.sender == yieldManager, "Only YieldManager");
        _;
    }

    constructor(address _usdc, address _aavePool, address _aToken, address _yieldManager) {
        usdcToken = IERC20(_usdc);
        aavePool = IAaveV3Pool(_aavePool);
        aToken = IERC20(_aToken);
        yieldManager = _yieldManager;
    }

    /// @inheritdoc IYieldAdapter
    function deposit(uint256 amount) external override onlyYieldManager {
        usdcToken.safeTransferFrom(msg.sender, address(this), amount);
        usdcToken.safeIncreaseAllowance(address(aavePool), amount);
        aavePool.supply(address(usdcToken), amount, address(this), 0);
    }

    /// @inheritdoc IYieldAdapter
    function withdraw(uint256 amount) external override onlyYieldManager returns (uint256 actualAmount) {
        actualAmount = aavePool.withdraw(address(usdcToken), amount, msg.sender);
    }

    /// @inheritdoc IYieldAdapter
    function withdrawAll() external override onlyYieldManager returns (uint256 actualAmount) {
        uint256 balance = aToken.balanceOf(address(this));
        if (balance == 0) return 0;
        actualAmount = aavePool.withdraw(address(usdcToken), type(uint256).max, msg.sender);
    }

    /// @inheritdoc IYieldAdapter
    function getBalance() external view override returns (uint256) {
        return aToken.balanceOf(address(this));
    }

    /// @inheritdoc IYieldAdapter
    function getAPY() external view override returns (uint256) {
        IAaveV3Pool.ReserveData memory data = aavePool.getReserveData(address(usdcToken));
        // currentLiquidityRate is in RAY (1e27), convert to basis points (1e4)
        // APY = liquidityRate / 1e27 * 10000
        return (uint256(data.currentLiquidityRate) * 10000) / RAY;
    }

    /// @inheritdoc IYieldAdapter
    function protocolName() external pure override returns (string memory) {
        return "Aave V3";
    }

    /// @inheritdoc IYieldAdapter
    function usdc() external view override returns (address) {
        return address(usdcToken);
    }
}

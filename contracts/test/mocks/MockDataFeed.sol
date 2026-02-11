// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title MockDataFeed
/// @notice Mock Chainlink AggregatorV3Interface for testing
contract MockDataFeed {
    int256 private _price;
    uint8 private _decimals;
    uint256 private _updatedAt;

    constructor(int256 price, uint8 dec) {
        _price = price;
        _decimals = dec;
        _updatedAt = block.timestamp;
    }

    function decimals() external view returns (uint8) {
        return _decimals;
    }

    function latestRoundData()
        external
        view
        returns (uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound)
    {
        return (1, _price, block.timestamp, _updatedAt, 1);
    }

    function setPrice(int256 price) external {
        _price = price;
        _updatedAt = block.timestamp;
    }
}

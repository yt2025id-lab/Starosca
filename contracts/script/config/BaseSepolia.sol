// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title BaseSepolia
/// @notice Contract addresses for Base Sepolia testnet
library BaseSepolia {
    // USDC on Base Sepolia (Circle test USDC)
    address constant USDC = 0x036CbD53842c5426634e7929541eC2318f3dCF7e;

    // Chainlink VRF v2.5 on Base Sepolia
    address constant VRF_COORDINATOR = 0x5C210eF41CD1a72de73bF76eC39637bB0d3d7BEE;
    bytes32 constant VRF_KEY_HASH = 0x9e1344a1247c8a1785d0a4681a27152bffdb43666ae5bf7d14d24a5efd44bf71;

    // Chainlink Data Feeds on Base Sepolia
    address constant USDC_USD_FEED = 0xd30e2101a97dcbAeBCBC04F14C3f624E67A35165;
    address constant ETH_USD_FEED = 0x4ADC67d868f2c653b1AE0d5F5C6d0fF2B2543F43;

    // Chainlink CCIP Router on Base Sepolia
    address constant CCIP_ROUTER = 0xD3b06cEbF099CE7DA4AcCf578aaebFDBd6e88a93;

    // Chainlink Functions Router on Base Sepolia
    address constant FUNCTIONS_ROUTER = 0xf9B8fc078197181C841c296C876945aaa425B278;

    // DeFi Protocols on Base Sepolia (testnet may not have these)
    // For testing, we use mock adapters
    address constant AAVE_V3_POOL = address(0); // Deploy mock for testnet
    address constant COMPOUND_V3_COMET = address(0); // Deploy mock for testnet
    address constant MOONWELL_MUSDC = address(0); // Deploy mock for testnet

    // CCIP Chain Selectors
    uint64 constant ETHEREUM_SEPOLIA_SELECTOR = 16015286601757825753;
    uint64 constant ARBITRUM_SEPOLIA_SELECTOR = 3478487238524512106;
    uint64 constant BASE_SEPOLIA_SELECTOR = 10344971235874465080;
}

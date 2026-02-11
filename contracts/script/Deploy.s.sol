// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {StaroscaFactory} from "../src/StaroscaFactory.sol";
import {YieldManager} from "../src/YieldManager.sol";
import {CrossChainDeposit} from "../src/CrossChainDeposit.sol";
import {MockYieldAdapter} from "../test/mocks/MockYieldAdapter.sol";
import {BaseSepolia} from "./config/BaseSepolia.sol";

/// @title Deploy
/// @notice Deployment script for Starosca protocol on Base Sepolia
/// @dev Uses mock yield adapters since DeFi protocols are not on testnet
contract Deploy is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("DEPLOYER_PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        uint256 vrfSubscriptionId = vm.envUint("VRF_SUBSCRIPTION_ID");

        console.log("Deploying Starosca to Base Sepolia...");
        console.log("Deployer:", deployer);

        vm.startBroadcast(deployerPrivateKey);

        // 1. Deploy YieldManager
        YieldManager yieldManager = new YieldManager(BaseSepolia.USDC, deployer);
        console.log("YieldManager deployed:", address(yieldManager));

        // 2. Deploy StaroscaFactory (includes VRF consumer)
        StaroscaFactory factory = new StaroscaFactory(
            BaseSepolia.VRF_COORDINATOR,
            BaseSepolia.USDC,
            address(yieldManager),
            BaseSepolia.USDC_USD_FEED,
            BaseSepolia.VRF_KEY_HASH,
            vrfSubscriptionId
        );
        console.log("StaroscaFactory deployed:", address(factory));

        // 3. Configure YieldManager
        yieldManager.setFactory(address(factory));
        console.log("YieldManager factory set");

        // 4. Deploy mock yield adapters (testnet — no real DeFi protocols)
        MockYieldAdapter aaveAdapter = new MockYieldAdapter(
            BaseSepolia.USDC, "Aave V3 (Mock)", 450 // 4.5% APY
        );
        MockYieldAdapter compoundAdapter = new MockYieldAdapter(
            BaseSepolia.USDC, "Compound V3 (Mock)", 380 // 3.8% APY
        );
        MockYieldAdapter moonwellAdapter = new MockYieldAdapter(
            BaseSepolia.USDC, "Moonwell (Mock)", 520 // 5.2% APY
        );
        console.log("Mock Aave adapter:", address(aaveAdapter));
        console.log("Mock Compound adapter:", address(compoundAdapter));
        console.log("Mock Moonwell adapter:", address(moonwellAdapter));

        // 5. Add adapters to YieldManager
        yieldManager.addAdapter(address(aaveAdapter));
        yieldManager.addAdapter(address(compoundAdapter));
        yieldManager.addAdapter(address(moonwellAdapter));
        console.log("Adapters added to YieldManager");

        // 6. Deploy CrossChainDeposit
        CrossChainDeposit ccipDeposit = new CrossChainDeposit(
            BaseSepolia.CCIP_ROUTER,
            BaseSepolia.USDC,
            address(factory)
        );
        console.log("CrossChainDeposit deployed:", address(ccipDeposit));

        // 7. Configure CCIP allowed chains
        ccipDeposit.setAllowedSourceChain(BaseSepolia.ETHEREUM_SEPOLIA_SELECTOR, true);
        ccipDeposit.setAllowedSourceChain(BaseSepolia.ARBITRUM_SEPOLIA_SELECTOR, true);
        console.log("CCIP source chains configured");

        vm.stopBroadcast();

        // Log summary
        console.log("");
        console.log("========================================");
        console.log("=== Starosca Deployment Summary ===");
        console.log("========================================");
        console.log("YieldManager:        ", address(yieldManager));
        console.log("StaroscaFactory:     ", address(factory));
        console.log("Pool Implementation: ", factory.poolImplementation());
        console.log("CrossChainDeposit:   ", address(ccipDeposit));
        console.log("Aave Adapter (Mock): ", address(aaveAdapter));
        console.log("Compound Adapter:    ", address(compoundAdapter));
        console.log("Moonwell Adapter:    ", address(moonwellAdapter));
        console.log("========================================");
        console.log("");
        console.log("Next steps:");
        console.log("1. Add factory address as VRF consumer in Chainlink subscription");
        console.log("2. Register Automation upkeeps on automation.chain.link");
        console.log("3. Update frontend .env with deployed addresses");
    }
}

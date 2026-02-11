// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {StaroscaFactory} from "../src/StaroscaFactory.sol";
import {YieldManager} from "../src/YieldManager.sol";
import {CrossChainDeposit} from "../src/CrossChainDeposit.sol";
import {AaveV3Adapter} from "../src/adapters/AaveV3Adapter.sol";
import {CompoundV3Adapter} from "../src/adapters/CompoundV3Adapter.sol";
import {MoonwellAdapter} from "../src/adapters/MoonwellAdapter.sol";
import {BaseSepolia} from "./config/BaseSepolia.sol";

/// @title Deploy
/// @notice Deployment script for Starosca protocol on Base Sepolia
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

        // 4. Deploy CrossChainDeposit
        CrossChainDeposit ccipDeposit = new CrossChainDeposit(
            BaseSepolia.CCIP_ROUTER,
            BaseSepolia.USDC,
            address(factory)
        );
        console.log("CrossChainDeposit deployed:", address(ccipDeposit));

        // 5. Configure CCIP allowed chains
        ccipDeposit.setAllowedSourceChain(BaseSepolia.ETHEREUM_SEPOLIA_SELECTOR, true);
        ccipDeposit.setAllowedSourceChain(BaseSepolia.ARBITRUM_SEPOLIA_SELECTOR, true);
        console.log("CCIP source chains configured");

        vm.stopBroadcast();

        // Log summary
        console.log("");
        console.log("=== Deployment Summary ===");
        console.log("YieldManager:       ", address(yieldManager));
        console.log("StaroscaFactory:    ", address(factory));
        console.log("CrossChainDeposit:  ", address(ccipDeposit));
        console.log("Pool Implementation:", factory.poolImplementation());
        console.log("");
        console.log("Next steps:");
        console.log("1. Add factory as VRF consumer in subscription");
        console.log("2. Register Automation upkeeps");
        console.log("3. Deploy & add yield adapters (or mocks for testnet)");
    }
}

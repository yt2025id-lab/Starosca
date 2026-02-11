// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";

interface IVRFCoordinatorV2Plus {
    function createSubscription() external returns (uint256 subId);
    function addConsumer(uint256 subId, address consumer) external;
    function getSubscription(uint256 subId)
        external
        view
        returns (uint96 balance, uint96 nativeBalance, uint64 reqCount, address subOwner, address[] memory consumers);
}

/// @notice Step 1: Create VRF subscription
contract CreateVRFSub is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("DEPLOYER_PRIVATE_KEY");
        address vrfCoordinator = 0x5C210eF41CD1a72de73bF76eC39637bB0d3d7BEE;

        vm.startBroadcast(deployerPrivateKey);
        uint256 subId = IVRFCoordinatorV2Plus(vrfCoordinator).createSubscription();
        vm.stopBroadcast();

        console.log("VRF Subscription ID:", subId);
        console.log("Save this ID, then run AddVRFConsumer with VRF_SUB_ID env var");
    }
}

/// @notice Step 2: Add factory as VRF consumer
contract AddVRFConsumer is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("DEPLOYER_PRIVATE_KEY");
        uint256 subId = vm.envUint("VRF_SUB_ID");
        address vrfCoordinator = 0x5C210eF41CD1a72de73bF76eC39637bB0d3d7BEE;
        address factory = 0x6D59cE9DfC9dB97C8b4EBCF53807b606BB4Ed370;

        console.log("Adding consumer to subscription:", subId);
        console.log("Factory:", factory);

        vm.startBroadcast(deployerPrivateKey);
        IVRFCoordinatorV2Plus(vrfCoordinator).addConsumer(subId, factory);
        vm.stopBroadcast();

        console.log("Factory added as VRF consumer!");
    }
}

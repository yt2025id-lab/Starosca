// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {VRFV2PlusClient} from
    "@chainlink/contracts/src/v0.8/vrf/dev/libraries/VRFV2PlusClient.sol";

/// @title MockVRFCoordinator
/// @notice Mock VRF Coordinator for testing — instantly fulfills with controllable randomness
contract MockVRFCoordinator {
    uint256 private _nextRequestId = 1;
    uint256 private _randomWord;

    // Store the last consumer for fulfillment
    mapping(uint256 => address) public requestConsumer;

    event RandomWordsRequested(uint256 indexed requestId, address consumer);
    event RandomWordsFulfilled(uint256 indexed requestId);

    /// @notice Set the random word to return
    function setRandomWord(uint256 randomWord) external {
        _randomWord = randomWord;
    }

    /// @notice Mock requestRandomWords that matches VRF Coordinator V2.5 interface
    function requestRandomWords(VRFV2PlusClient.RandomWordsRequest calldata)
        external
        returns (uint256 requestId)
    {
        requestId = _nextRequestId++;
        requestConsumer[requestId] = msg.sender;
        emit RandomWordsRequested(requestId, msg.sender);
    }

    /// @notice Manually fulfill a request (simulates VRF callback)
    function fulfillRandomWords(uint256 requestId) external {
        address consumer = requestConsumer[requestId];
        require(consumer != address(0), "Request not found");

        uint256[] memory words = new uint256[](1);
        words[0] = _randomWord;

        // Call rawFulfillRandomWords on the consumer
        (bool success,) = consumer.call(
            abi.encodeWithSignature("rawFulfillRandomWords(uint256,uint256[])", requestId, words)
        );
        require(success, "Fulfillment failed");

        delete requestConsumer[requestId];
        emit RandomWordsFulfilled(requestId);
    }

    /// @notice Fulfill with a specific random word
    function fulfillRandomWordsWithValue(uint256 requestId, uint256 randomWord) external {
        address consumer = requestConsumer[requestId];
        require(consumer != address(0), "Request not found");

        uint256[] memory words = new uint256[](1);
        words[0] = randomWord;

        (bool success,) = consumer.call(
            abi.encodeWithSignature("rawFulfillRandomWords(uint256,uint256[])", requestId, words)
        );
        require(success, "Fulfillment failed");

        delete requestConsumer[requestId];
        emit RandomWordsFulfilled(requestId);
    }
}

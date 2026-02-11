// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Clones} from "@openzeppelin/contracts/proxy/Clones.sol";
import {VRFConsumerBaseV2Plus} from
    "@chainlink/contracts/src/v0.8/vrf/dev/VRFConsumerBaseV2Plus.sol";
import {VRFV2PlusClient} from
    "@chainlink/contracts/src/v0.8/vrf/dev/libraries/VRFV2PlusClient.sol";
import {IStaroscaPool} from "./interfaces/IStaroscaPool.sol";
import {StaroscaTypes} from "./libraries/StaroscaTypes.sol";
import {StaroscaPool} from "./StaroscaPool.sol";

/// @title StaroscaFactory
/// @notice Factory for creating Starosca pool instances via EIP-1167 clones
/// @dev Also serves as the VRF v2.5 consumer for all pools (dispatches results)
contract StaroscaFactory is VRFConsumerBaseV2Plus {
    // ============ State Variables ============

    address public immutable poolImplementation;
    address public immutable yieldManager;
    address public immutable usdcToken;
    address public immutable dataFeed; // Chainlink USDC/USD price feed

    // VRF v2.5 config
    bytes32 public vrfKeyHash;
    uint256 public vrfSubscriptionId;
    uint16 public vrfRequestConfirmations;
    uint32 public vrfCallbackGasLimit;

    // Pool registry
    address[] public allPools;
    mapping(address => bool) public isPool;
    mapping(address => address[]) public userPools;

    // VRF request tracking: requestId => (pool, month)
    struct VRFRequest {
        address pool;
        uint8 month;
    }
    mapping(uint256 => VRFRequest) public vrfRequests;

    // ============ Events ============

    event VRFConfigUpdated(bytes32 keyHash, uint256 subscriptionId);

    // ============ Constructor ============

    constructor(
        address _vrfCoordinator,
        address _usdc,
        address _yieldManager,
        address _dataFeed,
        bytes32 _vrfKeyHash,
        uint256 _vrfSubscriptionId
    ) VRFConsumerBaseV2Plus(_vrfCoordinator) {
        usdcToken = _usdc;
        yieldManager = _yieldManager;
        dataFeed = _dataFeed;
        vrfKeyHash = _vrfKeyHash;
        vrfSubscriptionId = _vrfSubscriptionId;
        vrfRequestConfirmations = 3;
        vrfCallbackGasLimit = 300_000;

        // Deploy implementation contract for cloning
        poolImplementation = address(new StaroscaPool());
    }

    // ============ Pool Creation ============

    /// @notice Create a new Starosca pool
    /// @param maxParticipants Number of participants (min 3)
    /// @param monthlyContribution Monthly contribution in USDC (6 decimals)
    /// @return pool Address of the new pool
    function createPool(uint8 maxParticipants, uint256 monthlyContribution)
        external
        returns (address pool)
    {
        if (maxParticipants < 3) revert StaroscaTypes.InvalidParticipantCount();
        if (monthlyContribution == 0) revert StaroscaTypes.ZeroAmount();

        // Deploy clone
        bytes32 salt = keccak256(abi.encodePacked(msg.sender, allPools.length, block.timestamp));
        pool = Clones.cloneDeterministic(poolImplementation, salt);

        // Initialize the pool
        IStaroscaPool(pool).initialize(
            address(this),
            yieldManager,
            usdcToken,
            address(s_vrfCoordinator),
            vrfKeyHash,
            vrfSubscriptionId,
            dataFeed,
            maxParticipants,
            monthlyContribution,
            msg.sender
        );

        // Register pool
        allPools.push(pool);
        isPool[pool] = true;
        userPools[msg.sender].push(pool);

        emit StaroscaTypes.PoolCreated(pool, msg.sender, maxParticipants, monthlyContribution);
    }

    // ============ VRF Functions ============

    /// @notice Request VRF randomness for a pool drawing
    /// @dev Called by StaroscaPool.requestDrawing()
    /// @param pool The pool address requesting randomness
    /// @param month The drawing month
    /// @return requestId The VRF request ID
    function requestVRFForPool(address pool, uint8 month) external returns (uint256 requestId) {
        require(isPool[msg.sender] && msg.sender == pool, "Only registered pool");

        requestId = s_vrfCoordinator.requestRandomWords(
            VRFV2PlusClient.RandomWordsRequest({
                keyHash: vrfKeyHash,
                subId: vrfSubscriptionId,
                requestConfirmations: vrfRequestConfirmations,
                callbackGasLimit: vrfCallbackGasLimit,
                numWords: 1,
                extraArgs: VRFV2PlusClient._argsToBytes(
                    VRFV2PlusClient.ExtraArgsV1({nativePayment: false})
                )
            })
        );

        vrfRequests[requestId] = VRFRequest({pool: pool, month: month});
    }

    /// @notice VRF v2.5 callback — dispatches randomness to the requesting pool
    function fulfillRandomWords(uint256 requestId, uint256[] calldata randomWords) internal override {
        VRFRequest memory req = vrfRequests[requestId];
        require(req.pool != address(0), "Unknown request");

        // Forward the random word to the pool
        StaroscaPool(req.pool).fulfillDrawing(req.month, randomWords[0]);

        // Clean up
        delete vrfRequests[requestId];
    }

    // ============ Admin Functions ============

    /// @notice Update VRF configuration
    function updateVRFConfig(
        bytes32 _keyHash,
        uint256 _subscriptionId,
        uint16 _requestConfirmations,
        uint32 _callbackGasLimit
    ) external onlyOwner {
        vrfKeyHash = _keyHash;
        vrfSubscriptionId = _subscriptionId;
        vrfRequestConfirmations = _requestConfirmations;
        vrfCallbackGasLimit = _callbackGasLimit;

        emit VRFConfigUpdated(_keyHash, _subscriptionId);
    }

    // ============ View Functions ============

    function getPoolCount() external view returns (uint256) {
        return allPools.length;
    }

    function getPoolsByUser(address user) external view returns (address[] memory) {
        return userPools[user];
    }

    function getAllPools(uint256 offset, uint256 limit)
        external
        view
        returns (address[] memory pools)
    {
        uint256 total = allPools.length;
        if (offset >= total) return new address[](0);

        uint256 end = offset + limit;
        if (end > total) end = total;

        pools = new address[](end - offset);
        for (uint256 i = offset; i < end; i++) {
            pools[i - offset] = allPools[i];
        }
    }
}

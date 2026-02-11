// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {CCIPReceiver} from "@chainlink/contracts/src/v0.8/ccip/applications/CCIPReceiver.sol";
import {Client} from "@chainlink/contracts/src/v0.8/ccip/libraries/Client.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {StaroscaPool} from "./StaroscaPool.sol";
import {StaroscaFactory} from "./StaroscaFactory.sol";

/// @title CrossChainDeposit
/// @notice Receives USDC + instructions via Chainlink CCIP from other chains
/// @dev Allows users on Ethereum, Arbitrum, etc. to join or pay Starosca pools on Base
contract CrossChainDeposit is CCIPReceiver {
    using SafeERC20 for IERC20;

    // Action types
    uint8 public constant ACTION_JOIN = 1;
    uint8 public constant ACTION_PAY = 2;

    IERC20 public immutable usdcToken;
    StaroscaFactory public immutable factory;

    // Allowed source chains (chainSelector => allowed)
    mapping(uint64 => bool) public allowedSourceChains;
    // Allowed senders per chain (chainSelector => sender => allowed)
    mapping(uint64 => mapping(address => bool)) public allowedSenders;

    address public owner;

    event CrossChainJoin(
        bytes32 indexed messageId,
        uint64 indexed sourceChain,
        address indexed participant,
        address pool,
        uint256 amount
    );

    event CrossChainPayment(
        bytes32 indexed messageId,
        uint64 indexed sourceChain,
        address indexed participant,
        address pool,
        uint256 amount
    );

    event CrossChainActionFailed(
        bytes32 indexed messageId,
        uint64 sourceChain,
        bytes reason
    );

    error UnauthorizedSourceChain(uint64 chainSelector);
    error UnauthorizedSender(address sender);
    error InvalidAction(uint8 action);
    error OnlyOwner();

    modifier onlyOwner() {
        if (msg.sender != owner) revert OnlyOwner();
        _;
    }

    constructor(
        address _router,
        address _usdc,
        address _factory
    ) CCIPReceiver(_router) {
        usdcToken = IERC20(_usdc);
        factory = StaroscaFactory(_factory);
        owner = msg.sender;
    }

    /// @notice Process incoming CCIP messages
    /// @dev Decodes message data to determine action (join or pay)
    function _ccipReceive(Client.Any2EVMMessage memory message) internal override {
        // Validate source chain
        if (!allowedSourceChains[message.sourceChainSelector]) {
            revert UnauthorizedSourceChain(message.sourceChainSelector);
        }

        // Decode sender
        address sender = abi.decode(message.sender, (address));
        if (!allowedSenders[message.sourceChainSelector][sender]) {
            revert UnauthorizedSender(sender);
        }

        // Decode the message payload
        // Format: abi.encode(action, poolAddress, participantAddress)
        (uint8 action, address pool, address participant) =
            abi.decode(message.data, (uint8, address, address));

        // Ensure pool is valid
        require(factory.isPool(pool), "Invalid pool");

        // Get the received USDC amount
        require(message.destTokenAmounts.length > 0, "No tokens received");
        uint256 receivedAmount = message.destTokenAmounts[0].amount;

        if (action == ACTION_JOIN) {
            _handleJoin(message.messageId, message.sourceChainSelector, pool, participant, receivedAmount);
        } else if (action == ACTION_PAY) {
            _handlePayment(message.messageId, message.sourceChainSelector, pool, participant, receivedAmount);
        } else {
            revert InvalidAction(action);
        }
    }

    function _handleJoin(
        bytes32 messageId,
        uint64 sourceChain,
        address pool,
        address participant,
        uint256 amount
    ) internal {
        // Approve pool to spend USDC
        usdcToken.safeIncreaseAllowance(pool, amount);

        // We need to call join on behalf of the participant
        // This requires the pool to support a joinFor() function
        // For the MVP, we transfer USDC to participant and they join separately
        // In production, we'd add a joinFor(address) function to StaroscaPool
        usdcToken.safeTransfer(participant, amount);

        emit CrossChainJoin(messageId, sourceChain, participant, pool, amount);
    }

    function _handlePayment(
        bytes32 messageId,
        uint64 sourceChain,
        address pool,
        address participant,
        uint256 amount
    ) internal {
        usdcToken.safeTransfer(participant, amount);

        emit CrossChainPayment(messageId, sourceChain, participant, pool, amount);
    }

    // ============ Admin Functions ============

    function setAllowedSourceChain(uint64 chainSelector, bool allowed) external onlyOwner {
        allowedSourceChains[chainSelector] = allowed;
    }

    function setAllowedSender(uint64 chainSelector, address sender, bool allowed) external onlyOwner {
        allowedSenders[chainSelector][sender] = allowed;
    }

    function transferOwnership(address newOwner) external onlyOwner {
        owner = newOwner;
    }

    /// @notice Rescue stuck tokens
    function rescueTokens(address token, uint256 amount) external onlyOwner {
        IERC20(token).safeTransfer(owner, amount);
    }
}

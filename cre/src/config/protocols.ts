/**
 * Protocol configuration for yield optimization on Base Sepolia.
 * Contains contract addresses and API endpoints for supported yield protocols.
 */

// Base Sepolia testnet addresses
export const BASE_SEPOLIA_CHAIN_ID = 84532;

export const YIELD_MANAGER_ADDRESS = "0x0000000000000000000000000000000000000000"; // Update after deployment

export const PROTOCOLS = {
  aaveV3: {
    name: "Aave V3",
    pool: "0xA238Dd80C259a72e81d7e4664a9801593F98d1c5",
    aToken: "0x0000000000000000000000000000000000000000", // aUSDC on Base Sepolia
    adapterIndex: 0,
  },
  compoundV3: {
    name: "Compound V3",
    comet: "0xb125E6687d4313864e53df431d5425969c15Eb2F",
    adapterIndex: 1,
  },
  moonwell: {
    name: "Moonwell",
    mToken: "0xEdc817A28E8B93b03976FBd4a3dDBc9f7D176c22",
    adapterIndex: 2,
  },
} as const;

export const USDC_ADDRESS = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";

// DeFiLlama API endpoint for yield data
export const DEFILLAMA_YIELDS_URL = "https://yields.llama.fi/pools";

// YieldManager ABI fragments for rebalancing
export const YIELD_MANAGER_ABI = {
  rebalance: {
    name: "rebalance",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "fromAdapter", type: "address" },
      { name: "toAdapter", type: "address" },
    ],
    outputs: [],
  },
  getActiveAdapter: {
    name: "activeAdapter",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "address" }],
  },
  getAccruedYield: {
    name: "getAccruedYield",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "pool", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
} as const;

// Adapter ABI fragments for reading APY on-chain
export const ADAPTER_ABI = {
  getAPY: {
    name: "getAPY",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  getBalance: {
    name: "getBalance",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  protocolName: {
    name: "protocolName",
    type: "function",
    stateMutability: "pure",
    inputs: [],
    outputs: [{ name: "", type: "string" }],
  },
} as const;

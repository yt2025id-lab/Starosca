import StaroscaFactoryABI from "./abi/StaroscaFactory.json";
import StaroscaPoolABI from "./abi/StaroscaPool.json";
import YieldManagerABI from "./abi/YieldManager.json";

// Base Sepolia contract addresses — update after deployment
export const CONTRACTS = {
  factory: (process.env.NEXT_PUBLIC_FACTORY_ADDRESS ||
    "0x0000000000000000000000000000000000000000") as `0x${string}`,
  yieldManager: (process.env.NEXT_PUBLIC_YIELD_MANAGER_ADDRESS ||
    "0x0000000000000000000000000000000000000000") as `0x${string}`,
  usdc: "0x036CbD53842c5426634e7929541eC2318f3dCF7e" as `0x${string}`, // Base Sepolia USDC
} as const;

export const ABIS = {
  factory: StaroscaFactoryABI,
  pool: StaroscaPoolABI,
  yieldManager: YieldManagerABI,
} as const;

// ERC20 minimal ABI for USDC approve/balance
export const ERC20_ABI = [
  {
    name: "approve",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ type: "bool" }],
  },
  {
    name: "allowance",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
    ],
    outputs: [{ type: "uint256" }],
  },
  {
    name: "balanceOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ type: "uint256" }],
  },
  {
    name: "decimals",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint8" }],
  },
] as const;

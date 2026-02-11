export const USDC_DECIMALS = 6;

export const POOL_STATUS = {
  0: "Pending",
  1: "Active",
  2: "Completed",
  3: "Finalized",
  4: "Cancelled",
} as const;

export const PAYMENT_STATUS = {
  0: "Not Paid",
  1: "On Time",
  2: "Late",
  3: "Missed",
} as const;

export const PAYMENT_STATUS_COLORS = {
  0: "bg-gray-100 text-gray-700",
  1: "bg-green-100 text-green-700",
  2: "bg-yellow-100 text-yellow-700",
  3: "bg-red-100 text-red-700",
} as const;

export const POOL_STATUS_COLORS = {
  0: "bg-blue-100 text-blue-700",
  1: "bg-green-100 text-green-700",
  2: "bg-purple-100 text-purple-700",
  3: "bg-emerald-100 text-emerald-700",
  4: "bg-red-100 text-red-700",
} as const;

export function formatUSDC(amount: bigint): string {
  const whole = amount / BigInt(10 ** USDC_DECIMALS);
  const fraction = amount % BigInt(10 ** USDC_DECIMALS);
  const fractionStr = fraction.toString().padStart(USDC_DECIMALS, "0").slice(0, 2);
  return `${whole.toLocaleString()}.${fractionStr}`;
}

export function parseUSDC(amount: string): bigint {
  const [whole, fraction = ""] = amount.split(".");
  const paddedFraction = fraction.padEnd(USDC_DECIMALS, "0").slice(0, USDC_DECIMALS);
  return BigInt(whole) * BigInt(10 ** USDC_DECIMALS) + BigInt(paddedFraction);
}

export function truncateAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

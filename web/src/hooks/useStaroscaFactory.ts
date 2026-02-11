"use client";

import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { CONTRACTS, ABIS } from "@/lib/contracts";

export function usePoolCount() {
  return useReadContract({
    address: CONTRACTS.factory,
    abi: ABIS.factory,
    functionName: "getPoolCount",
  });
}

export function useAllPools(offset: number, limit: number) {
  return useReadContract({
    address: CONTRACTS.factory,
    abi: ABIS.factory,
    functionName: "getAllPools",
    args: [BigInt(offset), BigInt(limit)],
  });
}

export function useUserPools(userAddress: `0x${string}` | undefined) {
  return useReadContract({
    address: CONTRACTS.factory,
    abi: ABIS.factory,
    functionName: "getPoolsByUser",
    args: userAddress ? [userAddress] : undefined,
    query: { enabled: !!userAddress },
  });
}

export function useCreatePool() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const createPool = (maxParticipants: number, monthlyContribution: bigint) => {
    writeContract({
      address: CONTRACTS.factory,
      abi: ABIS.factory,
      functionName: "createPool",
      args: [maxParticipants, monthlyContribution],
    });
  };

  return { createPool, hash, isPending, isConfirming, isSuccess, error };
}

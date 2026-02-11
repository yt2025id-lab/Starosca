"use client";

import {
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { ABIS, CONTRACTS, ERC20_ABI } from "@/lib/contracts";

export function usePoolInfo(poolAddress: `0x${string}`) {
  return useReadContract({
    address: poolAddress,
    abi: ABIS.pool,
    functionName: "getPoolInfo",
  });
}

export function useParticipants(poolAddress: `0x${string}`) {
  return useReadContract({
    address: poolAddress,
    abi: ABIS.pool,
    functionName: "getParticipants",
  });
}

export function useIsParticipant(
  poolAddress: `0x${string}`,
  userAddress: `0x${string}` | undefined
) {
  return useReadContract({
    address: poolAddress,
    abi: ABIS.pool,
    functionName: "isParticipant",
    args: userAddress ? [userAddress] : undefined,
    query: { enabled: !!userAddress },
  });
}

export function usePaymentStatus(
  poolAddress: `0x${string}`,
  participant: `0x${string}` | undefined,
  month: number
) {
  return useReadContract({
    address: poolAddress,
    abi: ABIS.pool,
    functionName: "getPaymentStatus",
    args: participant ? [participant, month] : undefined,
    query: { enabled: !!participant && month > 0 },
  });
}

export function useDrawingEligible(poolAddress: `0x${string}`) {
  return useReadContract({
    address: poolAddress,
    abi: ABIS.pool,
    functionName: "getDrawingEligible",
  });
}

export function useMonthWinner(poolAddress: `0x${string}`, month: number) {
  return useReadContract({
    address: poolAddress,
    abi: ABIS.pool,
    functionName: "getMonthWinner",
    args: [month],
    query: { enabled: month > 0 },
  });
}

// ============ Write Hooks ============

export function useApproveUSDC() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } =
    useWaitForTransactionReceipt({ hash });

  const approve = (spender: `0x${string}`, amount: bigint) => {
    writeContract({
      address: CONTRACTS.usdc,
      abi: ERC20_ABI,
      functionName: "approve",
      args: [spender, amount],
    });
  };

  return { approve, hash, isPending, isConfirming, isSuccess, error };
}

export function useJoinPool(poolAddress: `0x${string}`) {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } =
    useWaitForTransactionReceipt({ hash });

  const join = () => {
    writeContract({
      address: poolAddress,
      abi: ABIS.pool,
      functionName: "join",
    });
  };

  return { join, hash, isPending, isConfirming, isSuccess, error };
}

export function useMakePayment(poolAddress: `0x${string}`) {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } =
    useWaitForTransactionReceipt({ hash });

  const pay = () => {
    writeContract({
      address: poolAddress,
      abi: ABIS.pool,
      functionName: "makePayment",
    });
  };

  return { pay, hash, isPending, isConfirming, isSuccess, error };
}

export function useClaim(poolAddress: `0x${string}`) {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } =
    useWaitForTransactionReceipt({ hash });

  const claim = () => {
    writeContract({
      address: poolAddress,
      abi: ABIS.pool,
      functionName: "claim",
    });
  };

  return { claim, hash, isPending, isConfirming, isSuccess, error };
}

export function useUSDCBalance(address: `0x${string}` | undefined) {
  return useReadContract({
    address: CONTRACTS.usdc,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });
}

export function useUSDCAllowance(
  owner: `0x${string}` | undefined,
  spender: `0x${string}`
) {
  return useReadContract({
    address: CONTRACTS.usdc,
    abi: ERC20_ABI,
    functionName: "allowance",
    args: owner ? [owner, spender] : undefined,
    query: { enabled: !!owner },
  });
}

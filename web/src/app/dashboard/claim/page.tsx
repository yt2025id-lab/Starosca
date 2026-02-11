"use client";

import { useAccount } from "wagmi";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useUserPools } from "@/hooks/useStaroscaFactory";
import { usePoolInfo, useClaim } from "@/hooks/useStaroscaPool";
import { formatUSDC, POOL_STATUS } from "@/lib/constants";

export default function ClaimPage() {
  const { address } = useAccount();
  const { data: userPoolAddrs, isLoading } = useUserPools(address);

  const poolAddresses = (userPoolAddrs ?? []) as `0x${string}`[];

  if (!address) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">Claim Distributions</h1>
        <p className="text-zinc-400">Connect your wallet to view claimable pools.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 space-y-6">
      <div className="flex items-center gap-2 text-sm text-zinc-500">
        <Link href="/dashboard" className="hover:text-violet-400">
          Dashboard
        </Link>
        <span>/</span>
        <span className="text-zinc-300">Claim</span>
      </div>

      <h1 className="text-2xl font-bold">Claim Distributions</h1>
      <p className="text-zinc-400 text-sm">
        When a pool is finalized, claim your remaining collateral + earned yield.
      </p>

      {isLoading ? (
        <p className="text-zinc-400">Loading your pools...</p>
      ) : poolAddresses.length === 0 ? (
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="pt-6 text-center">
            <p className="text-zinc-500">You have no pools to claim from.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {poolAddresses.map((addr) => (
            <ClaimablePoolCard key={addr} poolAddress={addr} />
          ))}
        </div>
      )}

      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white text-sm">Distribution Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-zinc-400 space-y-2">
          <p>When you claim, you receive:</p>
          <div className="space-y-1 ml-4">
            <p>1. <span className="text-zinc-200">Remaining Collateral</span> &mdash; original minus any missed payment deductions</p>
            <p>2. <span className="text-zinc-200">Collateral Yield</span> &mdash; proportional to time-weighted collateral held</p>
            <p>3. <span className="text-zinc-200">Contribution Yield</span> &mdash; proportional to on-time payment days</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ClaimablePoolCard({ poolAddress }: { poolAddress: `0x${string}` }) {
  const { data: info } = usePoolInfo(poolAddress);
  const {
    claim,
    isPending: claimPending,
    isConfirming: claimConfirming,
    isSuccess: claimSuccess,
  } = useClaim(poolAddress);

  if (!info) return null;

  type PoolInfo = {
    config: {
      maxParticipants: number;
      monthlyContribution: bigint;
      collateralPerUser: bigint;
      startTimestamp: bigint;
    };
    status: number;
    currentMonth: number;
    participantCount: number;
    totalCollateral: bigint;
    totalContributions: bigint;
  };

  const poolInfo = info as PoolInfo;
  const isFinalized = poolInfo.status === 3;
  const statusLabel =
    POOL_STATUS[poolInfo.status as keyof typeof POOL_STATUS] ?? "Unknown";

  return (
    <Card
      className={`bg-zinc-900 ${
        isFinalized ? "border-emerald-600/30" : "border-zinc-800"
      }`}
    >
      <CardContent className="pt-4">
        <div className="flex justify-between items-center mb-3">
          <Link
            href={`/pools/${poolAddress}`}
            className="font-mono text-sm text-zinc-300 hover:text-violet-400"
          >
            {poolAddress.slice(0, 6)}...{poolAddress.slice(-4)}
          </Link>
          <Badge
            className={
              isFinalized
                ? "bg-emerald-600/20 text-emerald-400"
                : "bg-zinc-700 text-zinc-300"
            }
          >
            {statusLabel}
          </Badge>
        </div>

        <div className="grid grid-cols-3 gap-4 text-sm mb-4">
          <div>
            <p className="text-zinc-500 text-xs">Monthly</p>
            <p className="text-white">
              ${formatUSDC(poolInfo.config.monthlyContribution)}
            </p>
          </div>
          <div>
            <p className="text-zinc-500 text-xs">Participants</p>
            <p className="text-white">{poolInfo.config.maxParticipants}</p>
          </div>
          <div>
            <p className="text-zinc-500 text-xs">Collateral</p>
            <p className="text-white">
              ${formatUSDC(poolInfo.config.collateralPerUser)}
            </p>
          </div>
        </div>

        {isFinalized && !claimSuccess && (
          <Button
            onClick={() => claim()}
            disabled={claimPending || claimConfirming}
            className="w-full bg-emerald-600 hover:bg-emerald-700"
          >
            {claimPending
              ? "Confirm in wallet..."
              : claimConfirming
              ? "Claiming..."
              : "Claim Distribution"}
          </Button>
        )}
        {claimSuccess && (
          <p className="text-emerald-400 text-sm text-center">
            Successfully claimed!
          </p>
        )}
        {!isFinalized && (
          <p className="text-zinc-500 text-xs text-center">
            Pool must be finalized before claiming
          </p>
        )}
      </CardContent>
    </Card>
  );
}

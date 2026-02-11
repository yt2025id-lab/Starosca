"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAllPools, usePoolCount } from "@/hooks/useStaroscaFactory";
import { usePoolInfo } from "@/hooks/useStaroscaPool";
import {
  formatUSDC,
  POOL_STATUS,
  POOL_STATUS_COLORS,
} from "@/lib/constants";

function PoolCard({ address }: { address: `0x${string}` }) {
  const { data: info, isLoading } = usePoolInfo(address);

  if (isLoading || !info) {
    return (
      <Card className="bg-zinc-900 border-zinc-800">
        <CardContent className="pt-6 space-y-3">
          <Skeleton className="h-4 w-20 bg-zinc-800" />
          <Skeleton className="h-6 w-32 bg-zinc-800" />
          <Skeleton className="h-4 w-full bg-zinc-800" />
        </CardContent>
      </Card>
    );
  }

  const poolInfo = info as {
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

  const statusIdx = poolInfo.status as keyof typeof POOL_STATUS;

  return (
    <Link href={`/pools/${address}`}>
      <Card className="bg-zinc-900 border-zinc-800 hover:border-violet-600/50 transition cursor-pointer">
        <CardContent className="pt-6">
          <div className="flex justify-between items-start mb-3">
            <Badge className={POOL_STATUS_COLORS[statusIdx]}>
              {POOL_STATUS[statusIdx]}
            </Badge>
            <span className="text-xs text-zinc-500 font-mono">
              {address.slice(0, 6)}...{address.slice(-4)}
            </span>
          </div>
          <div className="text-2xl font-bold text-white mb-1">
            ${formatUSDC(poolInfo.config.monthlyContribution)}/mo
          </div>
          <div className="text-sm text-zinc-400 space-y-1">
            <div className="flex justify-between">
              <span>Participants</span>
              <span className="text-white">
                {poolInfo.participantCount}/{poolInfo.config.maxParticipants}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Collateral/user</span>
              <span className="text-white">
                ${formatUSDC(poolInfo.config.collateralPerUser)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Month</span>
              <span className="text-white">
                {poolInfo.currentMonth}/{poolInfo.config.maxParticipants}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export default function PoolsPage() {
  const { data: poolCount } = usePoolCount();
  const count = poolCount ? Number(poolCount) : 0;
  const { data: pools, isLoading } = useAllPools(0, 50);

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Browse Pools</h1>
          <p className="text-zinc-400 mt-1">
            {count} pool{count !== 1 ? "s" : ""} available
          </p>
        </div>
        <Link href="/pools/create">
          <Button className="bg-violet-600 hover:bg-violet-700">
            Create Pool
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="grid md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="bg-zinc-900 border-zinc-800">
              <CardContent className="pt-6 space-y-3">
                <Skeleton className="h-4 w-20 bg-zinc-800" />
                <Skeleton className="h-8 w-32 bg-zinc-800" />
                <Skeleton className="h-4 w-full bg-zinc-800" />
                <Skeleton className="h-4 w-3/4 bg-zinc-800" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : pools && (pools as `0x${string}`[]).length > 0 ? (
        <div className="grid md:grid-cols-3 gap-4">
          {(pools as `0x${string}`[]).map((addr) => (
            <PoolCard key={addr} address={addr} />
          ))}
        </div>
      ) : (
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="py-12 text-center">
            <p className="text-zinc-400 mb-4">No pools created yet</p>
            <Link href="/pools/create">
              <Button className="bg-violet-600 hover:bg-violet-700">
                Create the first pool
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

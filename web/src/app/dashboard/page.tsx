"use client";

import Link from "next/link";
import { useAccount } from "wagmi";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useUserPools } from "@/hooks/useStaroscaFactory";
import { usePoolInfo, useUSDCBalance } from "@/hooks/useStaroscaPool";
import {
  formatUSDC,
  POOL_STATUS,
  POOL_STATUS_COLORS,
} from "@/lib/constants";

function UserPoolCard({ address }: { address: `0x${string}` }) {
  const { data: info } = usePoolInfo(address);

  if (!info) return null;

  const poolInfo = info as {
    config: {
      maxParticipants: number;
      monthlyContribution: bigint;
      collateralPerUser: bigint;
    };
    status: number;
    currentMonth: number;
    participantCount: number;
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
          <div className="text-lg font-bold text-white mb-2">
            ${formatUSDC(poolInfo.config.monthlyContribution)}/mo
          </div>
          <div className="text-sm text-zinc-400">
            Month {poolInfo.currentMonth}/{poolInfo.config.maxParticipants}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export default function DashboardPage() {
  const { address, isConnected } = useAccount();
  const { data: userPools } = useUserPools(address);
  const { data: balance } = useUSDCBalance(address);

  if (!isConnected) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
        <p className="text-zinc-400">Connect your wallet to view your pools</p>
      </div>
    );
  }

  const pools = (userPools as `0x${string}`[] | undefined) || [];

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Dashboard</h1>
        <div className="text-right">
          <p className="text-sm text-zinc-400">USDC Balance</p>
          <p className="text-lg font-bold text-white">
            ${balance ? formatUSDC(balance as bigint) : "0.00"}
          </p>
        </div>
      </div>

      {/* My Pools */}
      <Card className="bg-zinc-900 border-zinc-800 mb-6">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-white">My Pools ({pools.length})</CardTitle>
            <Link href="/pools/create">
              <Button size="sm" className="bg-violet-600 hover:bg-violet-700">
                Create Pool
              </Button>
            </Link>
          </div>
        </CardHeader>
      </Card>

      {pools.length > 0 ? (
        <div className="grid md:grid-cols-3 gap-4">
          {pools.map((addr) => (
            <UserPoolCard key={addr} address={addr} />
          ))}
        </div>
      ) : (
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="py-12 text-center">
            <p className="text-zinc-400 mb-4">
              You haven&apos;t joined any pools yet
            </p>
            <Link href="/pools">
              <Button className="bg-violet-600 hover:bg-violet-700">
                Browse Pools
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

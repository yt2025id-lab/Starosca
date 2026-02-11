"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useAccount } from "wagmi";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  usePoolInfo,
  useParticipants,
  useMonthWinner,
} from "@/hooks/useStaroscaPool";
import {
  formatUSDC,
  truncateAddress,
  POOL_STATUS,
} from "@/lib/constants";

export default function DrawingPage() {
  const params = useParams();
  const poolAddress = params.address as `0x${string}`;
  const { address: userAddress } = useAccount();

  const { data: info, isLoading } = usePoolInfo(poolAddress);
  const { data: participants } = useParticipants(poolAddress);

  if (isLoading || !info) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <p className="text-zinc-400">Loading drawing info...</p>
      </div>
    );
  }

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

  type ParticipantInfo = {
    addr: string;
    collateralDeposited: bigint;
    collateralRemaining: bigint;
    hasWon: boolean;
    wonInMonth: number;
  };

  const poolInfo = info as PoolInfo;
  const participantList = (participants ?? []) as ParticipantInfo[];
  const potSize =
    poolInfo.config.monthlyContribution * BigInt(poolInfo.config.maxParticipants);

  // Calculate days until next drawing (25th)
  const now = new Date();
  const drawingDay = 25;
  let nextDrawing = new Date(now.getFullYear(), now.getMonth(), drawingDay);
  if (now.getDate() >= drawingDay) {
    nextDrawing = new Date(now.getFullYear(), now.getMonth() + 1, drawingDay);
  }
  const daysUntil = Math.ceil(
    (nextDrawing.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );
  const isDrawingDay = now.getDate() === drawingDay;

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 space-y-6">
      <div className="flex items-center gap-2 text-sm text-zinc-500">
        <Link href={`/pools/${poolAddress}`} className="hover:text-violet-400">
          Pool
        </Link>
        <span>/</span>
        <span className="text-zinc-300">Drawing</span>
      </div>

      <h1 className="text-2xl font-bold">Monthly Drawing</h1>

      {/* Countdown */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardContent className="pt-6 text-center">
          {isDrawingDay ? (
            <div>
              <div className="text-5xl font-bold text-violet-400 mb-2">
                DRAWING DAY
              </div>
              <p className="text-zinc-400">
                Chainlink VRF will select today&apos;s winner
              </p>
            </div>
          ) : (
            <div>
              <div className="text-6xl font-bold text-white mb-2">
                {daysUntil}
              </div>
              <p className="text-zinc-400">days until next drawing (25th)</p>
            </div>
          )}
          <div className="mt-4 text-lg">
            Pot: <span className="text-violet-400 font-bold">${formatUSDC(potSize)} USDC</span>
          </div>
          <p className="text-xs text-zinc-500 mt-2">
            Month {poolInfo.currentMonth} of {poolInfo.config.maxParticipants}
          </p>
        </CardContent>
      </Card>

      {/* Drawing History */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white">Drawing History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: poolInfo.config.maxParticipants }, (_, i) => i + 1).map(
              (month) => (
                <DrawingRow
                  key={month}
                  poolAddress={poolAddress}
                  month={month}
                  currentMonth={poolInfo.currentMonth}
                  potSize={potSize}
                  userAddress={userAddress}
                />
              )
            )}
          </div>
        </CardContent>
      </Card>

      {/* Eligible Participants */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white">Participants</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {participantList.map((p, i) => (
              <div
                key={i}
                className="flex justify-between items-center p-3 rounded bg-zinc-800"
              >
                <span className="text-sm font-mono text-zinc-300">
                  {truncateAddress(p.addr)}
                  {p.addr.toLowerCase() === userAddress?.toLowerCase() && (
                    <span className="text-violet-400 ml-2">(You)</span>
                  )}
                </span>
                {p.hasWon ? (
                  <Badge className="bg-yellow-600/20 text-yellow-400">
                    Won Month {p.wonInMonth}
                  </Badge>
                ) : (
                  <Badge className="bg-zinc-700 text-zinc-300">Eligible</Badge>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* How it works */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white text-sm">How Drawing Works</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-zinc-400 space-y-2">
          <p>1. On the 25th of each month, Chainlink Automation triggers the drawing</p>
          <p>2. Missed payments are enforced (collateral deducted)</p>
          <p>3. Chainlink VRF generates a verifiable random number</p>
          <p>4. One eligible participant (who hasn&apos;t won yet) receives the pot</p>
          <p>5. Pot = {poolInfo.config.maxParticipants} participants x ${formatUSDC(poolInfo.config.monthlyContribution)} = ${formatUSDC(potSize)} USDC</p>
        </CardContent>
      </Card>
    </div>
  );
}

function DrawingRow({
  poolAddress,
  month,
  currentMonth,
  potSize,
  userAddress,
}: {
  poolAddress: `0x${string}`;
  month: number;
  currentMonth: number;
  potSize: bigint;
  userAddress: `0x${string}` | undefined;
}) {
  const { data: winner } = useMonthWinner(poolAddress, month);
  const winnerAddr = winner as `0x${string}` | undefined;
  const isCompleted =
    winnerAddr && winnerAddr !== "0x0000000000000000000000000000000000000000";
  const isCurrent = month === currentMonth;
  const isFuture = month > currentMonth;
  const isUserWinner =
    isCompleted && winnerAddr?.toLowerCase() === userAddress?.toLowerCase();

  return (
    <div
      className={`flex justify-between items-center p-3 rounded ${
        isCurrent
          ? "bg-violet-900/20 border border-violet-600/30"
          : "bg-zinc-800"
      }`}
    >
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-zinc-300">
          Month {month}
        </span>
        {isCurrent && (
          <Badge className="bg-violet-600/20 text-violet-400 text-xs">
            Current
          </Badge>
        )}
      </div>
      <div className="text-sm">
        {isCompleted ? (
          <span className="text-emerald-400">
            {truncateAddress(winnerAddr)}
            {isUserWinner && " (You!)"}
          </span>
        ) : isFuture ? (
          <span className="text-zinc-600">Upcoming</span>
        ) : (
          <span className="text-yellow-400">Pending</span>
        )}
      </div>
    </div>
  );
}

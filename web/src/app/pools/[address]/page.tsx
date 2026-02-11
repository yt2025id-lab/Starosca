"use client";

import { useParams } from "next/navigation";
import { useAccount } from "wagmi";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  usePoolInfo,
  useParticipants,
  useIsParticipant,
  useApproveUSDC,
  useJoinPool,
  useMakePayment,
  useClaim,
  useUSDCAllowance,
} from "@/hooks/useStaroscaPool";
import {
  formatUSDC,
  truncateAddress,
  POOL_STATUS,
  POOL_STATUS_COLORS,
  PAYMENT_STATUS,
  PAYMENT_STATUS_COLORS,
} from "@/lib/constants";

export default function PoolDetailPage() {
  const params = useParams();
  const poolAddress = params.address as `0x${string}`;
  const { address: userAddress } = useAccount();

  const { data: info, isLoading: infoLoading } = usePoolInfo(poolAddress);
  const { data: participants } = useParticipants(poolAddress);
  const { data: isParticipant } = useIsParticipant(poolAddress, userAddress);

  const { data: allowance } = useUSDCAllowance(userAddress, poolAddress);
  const { approve, isPending: approvePending, isSuccess: approveSuccess } =
    useApproveUSDC();
  const { join, isPending: joinPending, isConfirming: joinConfirming, isSuccess: joinSuccess } =
    useJoinPool(poolAddress);
  const { pay, isPending: payPending, isConfirming: payConfirming } =
    useMakePayment(poolAddress);
  const { claim, isPending: claimPending, isConfirming: claimConfirming } =
    useClaim(poolAddress);

  const isUserParticipant = !!isParticipant;

  if (infoLoading || !info) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <p className="text-zinc-400">Loading pool...</p>
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

  const statusIdx = poolInfo.status as keyof typeof POOL_STATUS;
  const totalDeposit = poolInfo.config.collateralPerUser + poolInfo.config.monthlyContribution;
  const needsApproval = !allowance || (allowance as bigint) < totalDeposit;
  const isPending = statusIdx === 0;
  const isActive = statusIdx === 1;
  const isFinalized = statusIdx === 3;
  const canJoin = isPending && !isUserParticipant && !!userAddress;

  const handleApproveAndJoin = () => {
    if (needsApproval) {
      approve(poolAddress, totalDeposit);
    } else {
      join();
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold">Pool Detail</h1>
            <Badge className={POOL_STATUS_COLORS[statusIdx]}>
              {POOL_STATUS[statusIdx]}
            </Badge>
          </div>
          <p className="text-sm text-zinc-500 font-mono">{poolAddress}</p>
        </div>
      </div>

      {/* Pool Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        {[
          {
            label: "Monthly",
            value: `$${formatUSDC(poolInfo.config.monthlyContribution)}`,
          },
          {
            label: "Participants",
            value: `${poolInfo.participantCount}/${poolInfo.config.maxParticipants}`,
          },
          {
            label: "Current Month",
            value: `${poolInfo.currentMonth}/${poolInfo.config.maxParticipants}`,
          },
          {
            label: "Pot Size",
            value: `$${formatUSDC(poolInfo.config.monthlyContribution * BigInt(poolInfo.config.maxParticipants))}`,
          },
        ].map((stat) => (
          <Card key={stat.label} className="bg-zinc-900 border-zinc-800">
            <CardContent className="pt-4 pb-4">
              <p className="text-xs text-zinc-500">{stat.label}</p>
              <p className="text-xl font-bold text-white">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Actions */}
      {canJoin && (
        <Card className="bg-zinc-900 border-violet-600/30">
          <CardHeader>
            <CardTitle className="text-white">Join This Pool</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 mb-4 text-sm">
              <div className="flex justify-between text-zinc-400">
                <span>Collateral</span>
                <span className="text-white">
                  ${formatUSDC(poolInfo.config.collateralPerUser)} USDC
                </span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>First month</span>
                <span className="text-white">
                  ${formatUSDC(poolInfo.config.monthlyContribution)} USDC
                </span>
              </div>
              <Separator className="bg-zinc-700" />
              <div className="flex justify-between font-semibold">
                <span className="text-zinc-300">Total</span>
                <span className="text-violet-400">
                  ${formatUSDC(totalDeposit)} USDC
                </span>
              </div>
            </div>
            <Button
              onClick={handleApproveAndJoin}
              disabled={approvePending || joinPending || joinConfirming}
              className="w-full bg-violet-600 hover:bg-violet-700"
            >
              {approvePending
                ? "Approving USDC..."
                : joinPending
                ? "Confirm in wallet..."
                : joinConfirming
                ? "Joining..."
                : needsApproval && !approveSuccess
                ? "Approve USDC"
                : "Join Pool"}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Payment action */}
      {isActive && isUserParticipant && (
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white">Monthly Payment</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-zinc-400 mb-4">
              Pay your monthly contribution of $
              {formatUSDC(poolInfo.config.monthlyContribution)} USDC. Pay before
              the 10th to earn yield.
            </p>
            <Button
              onClick={() => pay()}
              disabled={payPending || payConfirming}
              className="w-full bg-violet-600 hover:bg-violet-700"
            >
              {payPending
                ? "Confirm in wallet..."
                : payConfirming
                ? "Processing..."
                : `Pay $${formatUSDC(poolInfo.config.monthlyContribution)} USDC`}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Claim */}
      {isFinalized && isUserParticipant && (
        <Card className="bg-zinc-900 border-emerald-600/30">
          <CardHeader>
            <CardTitle className="text-white">Claim Your Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-zinc-400 mb-4">
              Pool is finalized. Claim your collateral + yield.
            </p>
            <Button
              onClick={() => claim()}
              disabled={claimPending || claimConfirming}
              className="w-full bg-emerald-600 hover:bg-emerald-700"
            >
              {claimPending ? "Confirm..." : claimConfirming ? "Claiming..." : "Claim"}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Participants */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white">Participants</CardTitle>
        </CardHeader>
        <CardContent>
          {participantList.length > 0 ? (
            <div className="space-y-2">
              {participantList.map((p, i) => (
                <div
                  key={i}
                  className="flex justify-between items-center p-3 rounded bg-zinc-800"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-mono text-zinc-300">
                      {truncateAddress(p.addr)}
                    </span>
                    {p.addr.toLowerCase() === userAddress?.toLowerCase() && (
                      <Badge className="bg-violet-600/20 text-violet-400 text-xs">
                        You
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-zinc-400">
                      Collateral: ${formatUSDC(p.collateralRemaining)}
                    </span>
                    {p.hasWon && (
                      <Badge className="bg-yellow-600/20 text-yellow-400">
                        Won M{p.wonInMonth}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-zinc-500 text-sm">No participants yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

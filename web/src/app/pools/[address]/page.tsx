"use client";

import { useParams } from "next/navigation";
import { useAccount } from "wagmi";
import { motion } from "framer-motion";
import { ArrowLeft, ShieldCheck, TrendingUp, Users, Calendar, Coins, Check, AlertCircle, ExternalLink } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
} from "@/lib/constants";

const statusToBadgeVariant = (idx: number): "primary" | "secondary" | "success" | "warning" => {
  switch (idx) {
    case 0: return 'warning';
    case 1: return 'primary';
    case 2: return 'success';
    case 3: return 'secondary';
    default: return 'secondary';
  }
};

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
      <div className="min-h-screen bg-bg-dark flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-white/40 font-mono text-xs uppercase tracking-widest">Synchronizing Pool Data...</p>
        </div>
      </div>
    );
  }

  const poolInfo = info as any;
  const participantList = (participants ?? []) as any[];

  const statusIdx = poolInfo.status;
  const totalDeposit = poolInfo.config.collateralPerUser + poolInfo.config.monthlyContribution;
  const needsApproval = !allowance || (allowance as bigint) < totalDeposit;
  const isPendingStatus = statusIdx === 0;
  const isActive = statusIdx === 1;
  const isFinalized = statusIdx === 3;
  const canJoin = isPendingStatus && !isUserParticipant && !!userAddress;

  const handleApproveAndJoin = () => {
    if (needsApproval) {
      approve(poolAddress, totalDeposit);
    } else {
      join();
    }
  };

  return (
    <div className="min-h-screen bg-bg-dark text-white pb-32">
      <div className="max-w-5xl mx-auto px-6 pt-16">
        {/* Back Link */}
        <Link href="/pools" className="inline-flex items-center gap-2 text-white/40 hover:text-white mb-8 group transition-colors">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-xs font-mono uppercase">Back to Directory</span>
        </Link>

        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <h1 className="text-4xl font-bold uppercase tracking-tighter">Pool <span className="text-brand-primary">Detail</span></h1>
              <Badge variant={statusToBadgeVariant(statusIdx)}>
                {POOL_STATUS[statusIdx as keyof typeof POOL_STATUS]}
              </Badge>
            </div>
            <div className="flex items-center gap-2 group cursor-pointer" onClick={() => window.open(`https://basescan.org/address/${poolAddress}`, '_blank')}>
              <span className="text-sm text-white/40 font-mono break-all">{poolAddress}</span>
              <ExternalLink size={12} className="text-white/20 group-hover:text-brand-primary" />
            </div>
          </div>

          <div className="flex gap-4">
            <div className="glass px-6 py-4 rounded-2xl border border-white/5 flex flex-col gap-1">
              <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">Total Pot Size</span>
              <span className="text-2xl font-bold text-brand-primary font-mono">
                ${formatUSDC(poolInfo.config.monthlyContribution * BigInt(poolInfo.config.maxParticipants))}
              </span>
            </div>
          </div>
        </header>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Monthly", value: `$${formatUSDC(poolInfo.config.monthlyContribution)}`, icon: <Coins size={14} /> },
                { label: "Members", value: `${poolInfo.participantCount}/${poolInfo.config.maxParticipants}`, icon: <Users size={14} /> },
                { label: "Progress", value: `M${poolInfo.currentMonth}/${poolInfo.config.maxParticipants}`, icon: <Calendar size={14} /> },
                { label: "Collateral", value: `$${formatUSDC(poolInfo.config.collateralPerUser)}`, icon: <ShieldCheck size={14} /> },
              ].map((stat) => (
                <Card key={stat.label} className="p-4 flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-white/40 uppercase font-mono text-[10px]">
                    {stat.icon}
                    {stat.label}
                  </div>
                  <div className="text-xl font-bold font-mono text-white">{stat.value}</div>
                </Card>
              ))}
            </div>

            {/* Participation Section */}
            <Card title="Participants" description="Active members in this rotating cycle.">
              {participantList.length > 0 ? (
                <div className="grid gap-3">
                  {participantList.map((p, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex justify-between items-center p-4 rounded-2xl bg-white/5 border border-white/5 group hover:border-brand-primary/20 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-[10px] font-mono font-bold text-white/40">
                          0{i + 1}
                        </div>
                        <span className="text-sm font-mono text-white/60">
                          {truncateAddress(p.addr)}
                        </span>
                        {p.addr.toLowerCase() === userAddress?.toLowerCase() && (
                          <Badge variant="primary">YOU</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-xs">
                        <span className="text-white/20 font-mono">
                          SECURED: ${formatUSDC(p.collateralRemaining)}
                        </span>
                        {p.hasWon && (
                          <Badge variant="success">WINNER M{p.wonInMonth}</Badge>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center border-2 border-dashed border-white/5 rounded-3xl">
                  <p className="text-white/20 font-mono text-xs uppercase italic">Awaiting first participant...</p>
                </div>
              )}
            </Card>
          </div>

          <div className="space-y-8">
            {/* Actions Sidebar */}
            {canJoin && (
              <Card
                title="Initialize Entry"
                className="bg-brand-primary/5 border-brand-primary/20"
                footer={
                  <Button
                    onClick={handleApproveAndJoin}
                    disabled={approvePending || joinPending || joinConfirming}
                    isLoading={approvePending || joinPending || joinConfirming}
                    className="w-full py-6 text-lg rounded-2xl shadow-[0_0_20px_rgba(0,255,136,0.2)]"
                  >
                    {needsApproval && !approveSuccess ? "Approve USDC" : "Join Smart Pool"}
                  </Button>
                }
              >
                <div className="space-y-4 py-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/40">Collateral (Refundable)</span>
                    <span className="text-white font-mono font-bold">${formatUSDC(poolInfo.config.collateralPerUser)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/40">Month 01 Contribution</span>
                    <span className="text-white font-mono font-bold">${formatUSDC(poolInfo.config.monthlyContribution)}</span>
                  </div>
                  <Separator className="bg-white/10" />
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-sm font-bold uppercase">Required Assets</span>
                    <span className="text-2xl font-bold text-brand-primary font-mono">${formatUSDC(totalDeposit)}</span>
                  </div>
                </div>
              </Card>
            )}

            {isActive && isUserParticipant && (
              <Card title="Monthly Contribution" description="Secure your spot in this month's VRF drawing.">
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5 mb-6">
                  <p className="text-[11px] font-mono text-white/40 uppercase leading-relaxed">
                    Pay before the <span className="text-brand-primary">10th</span> to maximize yield accumulation for the group.
                  </p>
                </div>
                <Button
                  onClick={() => pay()}
                  disabled={payPending || payConfirming}
                  isLoading={payPending || payConfirming}
                  className="w-full py-6 rounded-2xl"
                >
                  Pay ${formatUSDC(poolInfo.config.monthlyContribution)} USDC
                </Button>
              </Card>
            )}

            {isFinalized && isUserParticipant && (
              <Card title="Pool Finalized" className="bg-emerald-500/5 border-emerald-500/20">
                <p className="text-sm text-emerald-500/60 mb-6 font-medium">
                  The rotation is complete. You can now claim your remaining collateral plus any yield earned during the cycle.
                </p>
                <Button
                  variant="primary"
                  onClick={() => claim()}
                  disabled={claimPending || claimConfirming}
                  isLoading={claimPending || claimConfirming}
                  className="w-full py-6 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black border-none"
                >
                  Claim Assets & Yield
                </Button>
              </Card>
            )}

            {!isUserParticipant && !canJoin && (
              <Card className="text-center py-12">
                <AlertCircle size={32} className="mx-auto text-white/10 mb-4" />
                <p className="text-xs font-mono text-white/20 uppercase">No active actions for your account</p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
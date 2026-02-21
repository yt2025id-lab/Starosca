"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useAccount } from "wagmi";
import { motion } from "framer-motion";
import { ArrowLeft, Trophy, Calendar, Sparkles, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  usePoolInfo,
  useParticipants,
  useMonthWinner,
} from "@/hooks/useStaroscaPool";
import {
  formatUSDC,
  truncateAddress,
} from "@/lib/constants";

export default function DrawingPage() {
  const params = useParams();
  const poolAddress = params.address as `0x${string}`;
  const { address: userAddress } = useAccount();

  const { data: info, isLoading } = usePoolInfo(poolAddress);
  const { data: participants } = useParticipants(poolAddress);

  if (isLoading || !info) {
    return (
      <div className="min-h-screen bg-bg-dark flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-white/40 font-mono text-xs uppercase tracking-widest">Accessing Drawing Logs...</p>
        </div>
      </div>
    );
  }

  const poolInfo = info as any;
  const participantList = (participants ?? []) as any[];
  const potSize = poolInfo.config.monthlyContribution * BigInt(poolInfo.config.maxParticipants);

  const now = new Date();
  const drawingDay = 25;
  let nextDrawing = new Date(now.getFullYear(), now.getMonth(), drawingDay);
  if (now.getDate() >= drawingDay) {
    nextDrawing = new Date(now.getFullYear(), now.getMonth() + 1, drawingDay);
  }
  const daysUntil = Math.ceil((nextDrawing.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  const isDrawingDay = now.getDate() === drawingDay;

  return (
    <div className="min-h-screen bg-bg-dark text-white pb-32">
      <div className="max-w-4xl mx-auto px-6 pt-16">
        {/* Navigation */}
        <Link href={`/pools/${poolAddress}`} className="inline-flex items-center gap-2 text-white/40 hover:text-white mb-8 group transition-colors">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-xs font-mono uppercase">Back to Pool</span>
        </Link>

        {/* Header */}
        <header className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <h1 className="text-4xl font-bold uppercase tracking-tighter">Chainlink <span className="text-brand-primary">VRF</span></h1>
          </div>
          <p className="text-white/40 font-mono text-sm max-w-xl leading-relaxed">
            Transparent lot drawing powered by decentralized oracle networks.
            The pot is distributed every month on the 25th.
          </p>
        </header>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Countdown / Hero Card */}
            <Card className="overflow-hidden relative border-none">
              <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/10 to-transparent pointer-events-none" />
              <div className="relative p-12 flex flex-col items-center text-center">
                {isDrawingDay ? (
                  <motion.div
                    animate={{ scale: [1, 1.05, 1], rotate: [0, 1, -1, 0] }}
                    transition={{ repeat: Infinity, duration: 4 }}
                    className="flex flex-col items-center"
                  >
                    <Sparkles className="text-brand-primary mb-6" size={48} />
                    <h2 className="text-6xl font-black uppercase tracking-tighter mb-2">LIVE NOW</h2>
                    <p className="text-white/40 font-mono uppercase tracking-[0.2em] text-[10px]">Oracle Resolution in Progress</p>
                  </motion.div>
                ) : (
                  <>
                    <Calendar className="text-white/10 mb-6" size={32} />
                    <div className="text-8xl font-black font-mono text-white mb-2 tracking-tighter">
                      {daysUntil < 10 ? `0${daysUntil}` : daysUntil}
                    </div>
                    <p className="text-white/40 font-mono uppercase tracking-[0.2em] text-[10px]">Days until entropy release</p>
                  </>
                )}

                <div className="mt-12 flex flex-col items-center gap-1">
                  <span className="text-[10px] font-mono text-white/20 uppercase tracking-widest">Monthly Prize Pot</span>
                  <div className="text-4xl font-black font-mono text-brand-primary shadow-brand-primary/20 drop-shadow-xl">
                    ${formatUSDC(potSize)}
                  </div>
                </div>
              </div>
            </Card>

            {/* History Table */}
            <Card title="History" description="Verified records of previous drawings.">
              <div className="space-y-2 pt-4">
                {Array.from({ length: poolInfo.config.maxParticipants }, (_, i) => i + 1).map((month) => (
                  <DrawingRow
                    key={month}
                    poolAddress={poolAddress}
                    month={month}
                    currentMonth={poolInfo.currentMonth}
                    potSize={potSize}
                    userAddress={userAddress}
                  />
                ))}
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <Card title="Eligible Members">
              <div className="space-y-4 pt-4">
                {participantList.length > 0 ? (
                  participantList
                    .filter(p => !p.hasWon)
                    .map((p, i) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center text-[8px] font-mono text-white/20">
                            {i + 1}
                          </div>
                          <span className="text-xs font-mono text-white/60">{truncateAddress(p.addr)}</span>
                        </div>
                        <Badge variant="secondary" className="text-[9px] px-2 py-0 border-white/10">ELIGIBLE</Badge>
                      </div>
                    ))
                ) : (
                  <p className="text-[10px] font-mono text-white/20 uppercase text-center py-8 italic">No candidates available</p>
                )}
              </div>
            </Card>

            <Card title="The Mechanism" className="bg-white/5">
              <div className="space-y-4 pt-2">
                <p className="text-[11px] font-mono text-white/40 leading-relaxed italic">
                  Drawing happens automatically on the 25th of each month at 00:00 UTC.
                  The contract calls Chainlink VRF for non-bias entropy.
                </p>
                <Link href="#" className="flex items-center gap-2 text-[10px] font-mono text-brand-primary uppercase font-bold cursor-pointer group">
                  Verify Oracle Docs
                  <ChevronRight size={12} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </div>
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
  userAddress?: `0x${string}`;
}) {
  const { data: winnerAddress, isLoading } = useMonthWinner(poolAddress, month);

  const isPast = month < currentMonth;
  const isCurrent = month === currentMonth;

  return (
    <div className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${isCurrent ? 'bg-brand-primary/5 border-brand-primary/20 ring-1 ring-brand-primary/10' : 'bg-white/5 border-white/5 opacity-60'
      }`}>
      <div className="flex items-center gap-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-mono font-bold text-xs ${isCurrent ? 'bg-brand-primary text-black' : 'bg-white/5 text-white/40'
          }`}>
          M{month < 10 ? `0${month}` : month}
        </div>

        <div className="flex flex-col">
          <span className="text-[10px] font-mono uppercase tracking-widest text-white/40">Winner</span>
          {isLoading ? (
            <div className="h-4 w-24 bg-white/5 animate-pulse rounded mt-1" />
          ) : winnerAddress && (winnerAddress as string) !== "0x0000000000000000000000000000000000000000" ? (
            <div className="flex items-center gap-2">
              <span className="text-sm font-mono text-white font-medium">
                {truncateAddress(winnerAddress as string)}
              </span>
              {(winnerAddress as string).toLowerCase() === userAddress?.toLowerCase() && (
                <Badge variant="primary" className="text-[8px] py-0 h-4">YOU</Badge>
              )}
            </div>
          ) : (
            <span className="text-sm font-mono text-white/20 italic">
              {isPast ? "No drawing occurred" : "To be decided"}
            </span>
          )}
        </div>
      </div>

      <div className="text-right flex flex-col items-end">
        <span className="text-[10px] font-mono uppercase tracking-widest text-white/40">Pot</span>
        <span className={`text-sm font-mono font-bold ${isCurrent ? 'text-brand-primary' : 'text-white/60'}`}>
          ${formatUSDC(potSize)}
        </span>
      </div>
    </div>
  );
}

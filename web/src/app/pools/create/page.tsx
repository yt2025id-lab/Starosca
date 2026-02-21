"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Rocket, Users, Coins, ShieldCheck, TrendingUp, Info, ArrowRight, ChevronRight, Layers, Sparkles } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useCreatePool } from "@/hooks/useStaroscaFactory";
import { formatUSDC, parseUSDC } from "@/lib/constants";

export default function CreatePoolPage() {
  const { isConnected, address } = useAccount();
  const [participants, setParticipants] = useState(5);
  const [monthlyAmount, setMonthlyAmount] = useState("100");

  const { createPool, isPending, isConfirming, isSuccess, hash, error } =
    useCreatePool();

  const monthlyContribution = parseUSDC(monthlyAmount || "0");
  const collateral = monthlyContribution * BigInt(participants);
  const totalDeposit = collateral + monthlyContribution;

  useEffect(() => {
    if (isSuccess) {
      toast.success("Protocol Initialized", {
        description: "Your Smart Pool has been successfully deployed to Base.",
      });
    }
    if (error) {
      toast.error("Deployment Failed", {
        description: error.message || "An unexpected error occurred during pool creation.",
      });
    }
  }, [isSuccess, error]);

  const handleCreate = () => {
    if (!monthlyAmount || participants < 3) {
      toast.warning("Incomplete Configuration", {
        description: "Please specify a monthly amount and at least 3 participants.",
      });
      return;
    }
    createPool(participants, monthlyContribution);
  };

  return (
    <div className="min-h-screen bg-bg-dark text-white pb-32">
      {/* Background Glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-brand-primary/5 blur-[120px] pointer-events-none -z-10" />

      <div className="max-w-6xl mx-auto px-6 pt-20">
        <header className="mb-16 space-y-4">
          <Badge variant="primary" className="px-4 py-1.5 uppercase tracking-widest text-[10px] font-bold">
            Factory Interface v1.0
          </Badge>
          <h1 className="text-5xl font-black uppercase tracking-tighter leading-none">
            Initialize <span className="text-brand-primary">Smart Pool</span>
          </h1>
          <p className="text-white/40 font-mono text-sm max-w-xl leading-relaxed">
            Deploy a self-custodial rotating savings protocol. Verified members contribute monthly, while collateral ensures protocol integrity and generates optimized yield.
          </p>
        </header>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Configuration Column */}
          <div className="space-y-8">
            <Card
              title="Protocol Parameters"
              description="Define the structural constraints of your savings circle."
              className="relative overflow-hidden"
            >
              <div className="space-y-10 py-4">
                {/* Participants Slider */}
                <div className="space-y-6">
                  <div className="flex justify-between items-end">
                    <div className="flex gap-2 items-center text-white/60">
                      <Users size={16} className="text-brand-primary" />
                      <label className="text-xs font-mono uppercase tracking-widest">Network Size</label>
                    </div>
                    <span className="text-3xl font-black font-mono text-white">
                      {participants < 10 ? `0${participants}` : participants}
                    </span>
                  </div>
                  <div className="relative pt-2">
                    <input
                      type="range"
                      min={3}
                      max={12}
                      value={participants}
                      onChange={(e) => setParticipants(Number(e.target.value))}
                      className="w-full h-1.5 bg-white/5 rounded-lg appearance-none cursor-pointer accent-brand-primary"
                    />
                    <div className="flex justify-between mt-2 text-[10px] font-mono text-white/20 uppercase">
                      <span>Min: 03</span>
                      <span>Max: 12</span>
                    </div>
                  </div>
                </div>

                {/* Monthly Input */}
                <div className="space-y-4">
                  <div className="flex gap-2 items-center text-white/60">
                    <Coins size={16} className="text-brand-primary" />
                    <label className="text-xs font-mono uppercase tracking-widest">Contribution Level (USDC)</label>
                  </div>
                  <div className="relative group">
                    <Input
                      type="number"
                      min="10"
                      step="10"
                      value={monthlyAmount}
                      onChange={(e) => setMonthlyAmount(e.target.value)}
                      placeholder="100.00"
                      className="text-2xl h-20 font-mono bg-white/5 border-white/10 group-hover:border-brand-primary/30 transition-all font-bold px-6"
                    />
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 text-white/20 pointer-events-none font-mono">
                      USDC / MO
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* AI Yield Insight */}
            <div className="glass p-6 rounded-3xl border border-white/5 flex gap-4 items-start">
              <div className="bg-brand-primary/10 p-3 rounded-2xl">
                <Sparkles size={20} className="text-brand-primary" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold uppercase tracking-wider">Yield Optimization Active</h4>
                <p className="text-[11px] text-white/40 font-mono leading-relaxed italic">
                  Collateral is automatically routed through Aave-v3 on Base, capturing base APR + Starosca governance rewards.
                </p>
              </div>
            </div>
          </div>

          {/* Forecast Column */}
          <div className="space-y-6">
            <Card
              title="Economic Forecast"
              className="bg-white/[0.02]"
              footer={
                <div className="flex flex-col gap-4">
                  {!isConnected ? (
                    <Button variant="outline" className="w-full py-8 text-sm uppercase font-black tracking-widest rounded-2xl opacity-50 cursor-not-allowed">
                      Wallet Connection Required
                    </Button>
                  ) : (
                    <Button
                      onClick={handleCreate}
                      disabled={isPending || isConfirming || participants < 3}
                      isLoading={isPending || isConfirming}
                      className="w-full py-8 text-lg rounded-2xl shadow-[0_0_30px_rgba(0,255,136,0.15)] group"
                    >
                      Initialize Protocol
                      <ArrowRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  )}
                  {hash && (
                    <Link
                      href={`https://basescan.org/tx/${hash}`}
                      target="_blank"
                      className="text-center text-[10px] font-mono text-white/20 hover:text-brand-primary transition-colors uppercase tracking-widest flex items-center justify-center gap-1"
                    >
                      <Layers size={10} />
                      View Deployment on Blockscout <ChevronRight size={10} />
                    </Link>
                  )}
                </div>
              }
            >
              <div className="space-y-6 py-2">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-mono text-white/20 uppercase tracking-[0.2em]">Monthly Pot Size</span>
                  <div className="text-4xl font-black font-mono text-brand-primary">
                    ${formatUSDC(monthlyContribution * BigInt(participants))}
                    <span className="text-xs text-white/20 ml-2">USDC</span>
                  </div>
                </div>

                <div className="space-y-4 bg-black/20 p-6 rounded-3xl border border-white/5 font-mono">
                  <div className="flex justify-between items-center text-sm">
                    <div className="flex gap-2 items-center text-white/40">
                      <ShieldCheck size={12} />
                      <span>Collateral Obligation</span>
                    </div>
                    <span className="text-white font-bold">${formatUSDC(collateral)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <div className="flex gap-2 items-center text-white/40">
                      <TrendingUp size={12} />
                      <span>M01 Contribution</span>
                    </div>
                    <span className="text-white font-bold">${formatUSDC(monthlyContribution)}</span>
                  </div>
                  <Separator className="bg-white/5" />
                  <div className="flex justify-between items-end pt-2">
                    <span className="text-xs font-bold uppercase tracking-widest text-white/20">Initial Liquidity Required</span>
                    <span className="text-2xl font-black text-white">${formatUSDC(totalDeposit)}</span>
                  </div>
                </div>

                <div className="flex gap-3 text-[10px] font-mono text-white/40 leading-relaxed italic border-l-2 border-brand-primary/20 pl-4 py-1">
                  <Info size={14} className="shrink-0 text-brand-primary" />
                  <p>Pool duration: {participants} months. All collateral is returned to each user upon finalization, plus time-weighted yield rewards.</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

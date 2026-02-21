"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useAccount } from "wagmi";
import { Wallet, Plus, ArrowRight, LayoutDashboard, Coins, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useUserPools } from "@/hooks/useStaroscaFactory";
import { usePoolInfo, useUSDCBalance } from "@/hooks/useStaroscaPool";
import {
  formatUSDC,
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

function UserPoolCard({ address, index }: { address: `0x${string}`, index: number }) {
  const { data: info } = usePoolInfo(address);

  if (!info) return null;

  const poolInfo = info as any;
  const statusIdx = poolInfo.status;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Link href={`/pools/${address}`}>
        <Card className="hover:border-brand-primary/40 transition-all group">
          <div className="flex justify-between items-start mb-4">
            <Badge variant={statusToBadgeVariant(statusIdx)}>
              {POOL_STATUS[statusIdx as keyof typeof POOL_STATUS]}
            </Badge>
            <span className="text-[10px] text-white/20 font-mono tracking-widest uppercase">
              {address.slice(0, 6)}...{address.slice(-4)}
            </span>
          </div>
          <div className="text-xl font-bold text-white mb-2 group-hover:text-brand-primary transition-colors">
            ${formatUSDC(poolInfo.config.monthlyContribution)}/month
          </div>
          <div className="flex justify-between items-center text-[10px] font-mono text-white/40 uppercase tracking-tighter">
            <span>Progress</span>
            <span className="text-brand-primary">Month {poolInfo.currentMonth}/{poolInfo.config.maxParticipants}</span>
          </div>
        </Card>
      </Link>
    </motion.div>
  );
}

export default function DashboardPage() {
  const { address, isConnected } = useAccount();
  const { data: userPools } = useUserPools(address);
  const { data: balance } = useUSDCBalance(address);

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-bg-dark text-white flex items-center justify-center p-6">
        <Card className="max-w-md w-full text-center py-20 px-10 flex flex-col items-center gap-6">
          <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-2">
            <Wallet size={32} className="text-white/20" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold uppercase tracking-tight">Connect Wallet</h1>
            <p className="text-white/40">Securely sign in to view your personalized Starosca dashboard and active pools.</p>
          </div>
          <div className="w-full h-px bg-white/5 my-2" />
          <p className="text-[10px] font-mono text-white/20 uppercase tracking-[0.2em]">Awaiting Identity Provider</p>
        </Card>
      </div>
    );
  }

  const pools = (userPools as `0x${string}`[] | undefined) || [];

  return (
    <div className="min-h-screen bg-bg-dark text-white pb-32">
      <div className="max-w-7xl mx-auto px-6 pt-16">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-16">
          <div className="space-y-2">
            <Badge variant="secondary" className="mb-2">User Workspace</Badge>
            <h1 className="text-5xl md:text-6xl font-bold uppercase tracking-tighter flex items-center gap-4">
              <LayoutDashboard size={40} className="text-brand-primary hidden sm:block" />
              My <span className="text-brand-primary">Dashboard</span>
            </h1>
            <p className="text-white/40 max-w-md font-medium">
              Manage your active rotations and track your yield performance across the Base ecosystem.
            </p>
          </div>
          <div className="glass p-6 rounded-2xl flex flex-col gap-1 border border-white/5 min-w-[200px]">
            <div className="flex items-center gap-2 text-white/40 mb-1">
              <Coins size={14} />
              <span className="text-[10px] font-mono uppercase tracking-widest">Available Balance</span>
            </div>
            <p className="text-3xl font-bold flex items-baseline gap-1">
              <span className="text-brand-primary font-mono text-xl">$</span>
              {balance ? formatUSDC(balance as bigint) : "0.00"}
              <span className="text-xs text-white/20 font-mono ml-2">USDC</span>
            </p>
          </div>
        </header>

        <section className="grid gap-12">
          {/* Header Action */}
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <div className="flex items-center gap-3">
              <Activity size={20} className="text-brand-primary" />
              <h2 className="text-xl font-bold uppercase tracking-tight">Active Pools ({pools.length})</h2>
            </div>
            <Link href="/pools/create">
              <Button size="sm" variant="outline" className="rounded-xl">
                <Plus size={16} />
                Create Pool
              </Button>
            </Link>
          </div>

          {pools.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {pools.map((addr, idx) => (
                <UserPoolCard key={addr} address={addr} index={idx} />
              ))}
            </div>
          ) : (
            <Card className="py-24 text-center flex flex-col items-center gap-6">
              <div className="space-y-1 flex flex-col items-center gap-3">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center">
                  <Plus size={32} className="text-white/10" />
                </div>
                <div className="">

                  <h3 className="text-2xl font-bold uppercase">No Active Pools</h3>
                  <p className="text-white/40">You haven't joined or created any savings circles yet.</p>
                </div>
                <Link href="/pools">
                  <Button variant="primary">Explore Pools</Button>
                </Link>
              </div>
            </Card>
          )}
        </section>
      </div>
    </div>
  );
}

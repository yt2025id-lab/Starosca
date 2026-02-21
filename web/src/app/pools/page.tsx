"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Plus, ArrowRight, Activity, Users, ShieldCheck, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAllPools, usePoolCount } from "@/hooks/useStaroscaFactory";
import { usePoolInfo } from "@/hooks/useStaroscaPool";
import {
  formatUSDC,
  POOL_STATUS,
} from "@/lib/constants";

const statusToBadgeVariant = (idx: number): "primary" | "secondary" | "success" | "warning" => {
  switch (idx) {
    case 0: return 'warning';  // Pending
    case 1: return 'primary';  // Active
    case 2: return 'success';  // Completed
    case 3: return 'secondary'; // Finalized
    default: return 'secondary';
  }
};

function PoolCard({ address, index }: { address: `0x${string}`, index: number }) {
  const { data: info, isLoading } = usePoolInfo(address);

  if (isLoading || !info) {
    return (
      <Card className="h-full">
        <div className="space-y-4">
          <div className="flex justify-between">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-4 w-24" />
          </div>
          <Skeleton className="h-10 w-32" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
          </div>
        </div>
      </Card>
    );
  }

  const poolInfo = info as any;
  const statusIdx = poolInfo.status;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Link href={`/pools/${address}`}>
        <Card className="group hover:border-brand-primary/50 transition-all duration-300 h-full flex flex-col">
          <div className="flex justify-between items-start mb-6">
            <Badge variant={statusToBadgeVariant(statusIdx)}>
              {POOL_STATUS[statusIdx as keyof typeof POOL_STATUS]}
            </Badge>
            <span className="text-[10px] text-white/20 font-mono uppercase tracking-widest">
              {address.slice(0, 6)}...{address.slice(-4)}
            </span>
          </div>

          <div className="mb-8">
            <p className="text-[10px] font-mono text-white/40 uppercase mb-1">Monthly Contribution</p>
            <div className="text-3xl font-bold text-white flex items-baseline gap-1">
              <span className="text-brand-primary">$</span>
              {formatUSDC(poolInfo.config.monthlyContribution)}
            </div>
          </div>

          <div className="space-y-3 flex-1">
            <div className="flex justify-between items-center text-sm">
              <div className="flex items-center gap-2 text-white/40">
                <Users size={14} />
                <span>Participants</span>
              </div>
              <span className="font-mono font-bold text-white">
                {poolInfo.participantCount}/{poolInfo.config.maxParticipants}
              </span>
            </div>

            <div className="flex justify-between items-center text-sm">
              <div className="flex items-center gap-2 text-white/40">
                <ShieldCheck size={14} />
                <span>Collateral</span>
              </div>
              <span className="font-mono font-bold text-white">
                ${formatUSDC(poolInfo.config.collateralPerUser)}
              </span>
            </div>

            <div className="flex justify-between items-center text-sm">
              <div className="flex items-center gap-2 text-white/40">
                <Calendar size={14} />
                <span>Current Month</span>
              </div>
              <span className="font-mono font-bold text-brand-primary">
                {poolInfo.currentMonth}/{poolInfo.config.maxParticipants}
              </span>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-white/5 flex items-center justify-between group-hover:text-brand-primary transition-colors">
            <span className="text-xs font-bold uppercase tracking-tighter">View Pool Details</span>
            <ArrowRight size={16} className="transform group-hover:translate-x-1 transition-transform" />
          </div>
        </Card>
      </Link>
    </motion.div>
  );
}

export default function PoolsPage() {
  const { data: poolCount } = usePoolCount();
  const count = poolCount ? Number(poolCount) : 0;
  const { data: pools, isLoading } = useAllPools(0, 50);

  return (
    <div className="min-h-screen bg-bg-dark text-white pb-32">
      <div className="max-w-7xl mx-auto px-6 pt-16">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-16">
          <div className="space-y-2">
            <Badge variant="primary" className="mb-2">Protocol Live</Badge>
            <h1 className="text-5xl md:text-6xl font-bold uppercase tracking-tighter">
              Browse <span className="text-brand-primary">Pools</span>
            </h1>
            <p className="text-white/40 max-w-md font-medium">
              Join or create decentralized savings circles. {count} active pools available on the network.
            </p>
          </div>
          <Link href="/pools/create">
            <Button size="lg" className="rounded-2xl">
              <Plus size={20} />
              Create New Pool
            </Button>
          </Link>
        </header>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="h-64 flex flex-col justify-between">
                <div className="space-y-4">
                  <Skeleton className="h-6 w-24" />
                  <Skeleton className="h-10 w-48" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </Card>
            ))}
          </div>
        ) : pools && (pools as `0x${string}`[]).length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(pools as `0x${string}`[]).map((addr, idx) => (
              <PoolCard key={addr} address={addr} index={idx} />
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card className="py-24 text-center max-w-2xl mx-auto flex flex-col items-center gap-6">
              <div className="flex flex-col items-center gap-4">

                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-2">
                  <Activity size={32} className="text-white/20" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold uppercase">No Pools Found</h3>
                  <p className="text-white/40">Be the pioneer and start the first savings circle on Starosca.</p>
                </div>
                <Link href="/pools/create">
                  <Button variant="primary" size="lg">
                    Create First Pool
                  </Button>
                </Link>
              </div>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}

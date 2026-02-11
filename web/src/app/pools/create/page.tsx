"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useCreatePool } from "@/hooks/useStaroscaFactory";
import { formatUSDC, parseUSDC } from "@/lib/constants";

export default function CreatePoolPage() {
  const { isConnected } = useAccount();
  const [participants, setParticipants] = useState(5);
  const [monthlyAmount, setMonthlyAmount] = useState("100");

  const { createPool, isPending, isConfirming, isSuccess, hash, error } =
    useCreatePool();

  const monthlyContribution = parseUSDC(monthlyAmount || "0");
  const collateral = monthlyContribution * BigInt(participants);
  const totalDeposit = collateral + monthlyContribution;

  const handleCreate = () => {
    if (!monthlyAmount || participants < 3) return;
    createPool(participants, monthlyContribution);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Create a Starosca Pool</h1>

      <div className="space-y-6">
        {/* Config */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white">Pool Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm text-zinc-400 mb-2 block">
                Number of Participants (min 3)
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min={3}
                  max={12}
                  value={participants}
                  onChange={(e) => setParticipants(Number(e.target.value))}
                  className="flex-1 accent-violet-600"
                />
                <span className="text-2xl font-bold text-white w-10 text-center">
                  {participants}
                </span>
              </div>
            </div>
            <div>
              <label className="text-sm text-zinc-400 mb-2 block">
                Monthly Contribution (USDC)
              </label>
              <Input
                type="number"
                min="10"
                step="10"
                value={monthlyAmount}
                onChange={(e) => setMonthlyAmount(e.target.value)}
                placeholder="100"
                className="bg-zinc-800 border-zinc-700 text-white"
              />
            </div>
          </CardContent>
        </Card>

        {/* Summary */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white">Cost to Join</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-400">Collateral ({participants} x ${monthlyAmount})</span>
                <span className="text-white font-mono">
                  ${formatUSDC(collateral)} USDC
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-400">First month contribution</span>
                <span className="text-white font-mono">
                  ${formatUSDC(monthlyContribution)} USDC
                </span>
              </div>
              <div className="border-t border-zinc-700 pt-3 flex justify-between font-semibold">
                <span className="text-zinc-300">Total deposit per user</span>
                <span className="text-violet-400 font-mono">
                  ${formatUSDC(totalDeposit)} USDC
                </span>
              </div>
            </div>
            <div className="mt-4 p-3 rounded bg-zinc-800 text-xs text-zinc-400 space-y-1">
              <p>Pool duration: {participants} months</p>
              <p>
                Monthly pot: ${formatUSDC(monthlyContribution * BigInt(participants))} USDC
              </p>
              <p>Collateral returned at end + yield from AI optimizer</p>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        {!isConnected ? (
          <p className="text-center text-zinc-500">
            Connect your wallet to create a pool
          </p>
        ) : (
          <Button
            onClick={handleCreate}
            disabled={isPending || isConfirming || participants < 3}
            className="w-full bg-violet-600 hover:bg-violet-700 h-12 text-lg"
          >
            {isPending
              ? "Confirm in wallet..."
              : isConfirming
              ? "Creating pool..."
              : "Create Pool"}
          </Button>
        )}

        {isSuccess && hash && (
          <Card className="bg-green-900/20 border-green-800">
            <CardContent className="pt-6">
              <p className="text-green-400 font-semibold">Pool created successfully!</p>
              <a
                href={`https://sepolia.basescan.org/tx/${hash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-green-500 underline"
              >
                View on BaseScan
              </a>
            </CardContent>
          </Card>
        )}

        {error && (
          <Card className="bg-red-900/20 border-red-800">
            <CardContent className="pt-6">
              <p className="text-red-400 text-sm">{error.message}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

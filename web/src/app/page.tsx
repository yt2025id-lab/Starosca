import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
            Starosca
          </h1>
          <p className="text-xl text-zinc-400 mb-4">
            Collateralized ROSCA with AI Yield Optimization
          </p>
          <p className="text-lg text-zinc-500 mb-8 max-w-2xl mx-auto">
            A DeFi protocol combining the tradition of rotating savings (arisan)
            with staking yield optimization on Base. Your collateral earns yield
            while securing the group.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/pools">
              <Button size="lg" className="bg-violet-600 hover:bg-violet-700">
                Browse Pools
              </Button>
            </Link>
            <Link href="/pools/create">
              <Button size="lg" variant="outline">
                Create Pool
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 px-4 border-t border-zinc-800">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            How Starosca Works
          </h2>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              {
                step: "1",
                title: "Join a Pool",
                desc: "Deposit USDC collateral + first monthly contribution. Collateral = participants x monthly amount.",
              },
              {
                step: "2",
                title: "Monthly Payments",
                desc: "Pay your monthly contribution by the 10th for yield eligibility. Payments are deposited into yield protocols.",
              },
              {
                step: "3",
                title: "Monthly Drawing",
                desc: "On the 25th, Chainlink VRF randomly selects a winner who receives the full monthly pot.",
              },
              {
                step: "4",
                title: "Earn Yield",
                desc: "AI optimizer finds the best APY for your funds. At the end, get your collateral back + all accumulated yield.",
              },
            ].map((item) => (
              <Card key={item.step} className="bg-zinc-900 border-zinc-800">
                <CardContent className="pt-6">
                  <div className="w-10 h-10 rounded-full bg-violet-600/20 text-violet-400 flex items-center justify-center text-lg font-bold mb-4">
                    {item.step}
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-white">
                    {item.title}
                  </h3>
                  <p className="text-sm text-zinc-400">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Chainlink Integration */}
      <section className="py-16 px-4 border-t border-zinc-800">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">
            Powered by Chainlink
          </h2>
          <p className="text-zinc-400 text-center mb-12 max-w-2xl mx-auto">
            Starosca integrates 6 Chainlink products for a secure, automated,
            and cross-chain experience.
          </p>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              {
                name: "CRE Workflow",
                desc: "AI Yield Optimizer — fetches APY data, analyzes with AI, and auto-rebalances to best protocol",
              },
              {
                name: "VRF v2.5",
                desc: "Verifiable random drawing every month — provably fair winner selection",
              },
              {
                name: "Automation",
                desc: "Trustless monthly triggers for drawings, deadline enforcement, and finalization",
              },
              {
                name: "Data Feeds",
                desc: "Real-time USDC/USD and ETH/USD price feeds for accurate valuations",
              },
              {
                name: "Functions",
                desc: "Fetch APY data from external DeFi APIs for yield optimization",
              },
              {
                name: "CCIP",
                desc: "Cross-chain deposits — join pools on Base from Ethereum, Arbitrum, and more",
              },
            ].map((item) => (
              <Card key={item.name} className="bg-zinc-900 border-zinc-800">
                <CardContent className="pt-6">
                  <h3 className="text-sm font-semibold text-violet-400 mb-1">
                    {item.name}
                  </h3>
                  <p className="text-sm text-zinc-400">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

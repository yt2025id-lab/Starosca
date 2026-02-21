"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import {
  ArrowRight,
  Shield,
  Zap,
  Globe,
  Cpu,
  Layers,
  Database,
  Code,
  Cpu as Chip,
  Clock,
  Coins,
  BarChart3,
  Link as LinkIcon,
  Search,
  Users,
  Wallet,
  TrendingUp,
  RotateCw
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// --- Components ---

const TechIllustration = () => {
  const participants = [0, 1, 2, 3, 4, 5];

  return (
    <div className="relative w-full aspect-square max-w-[500px] mx-auto">
      {/* Central Rotating Pool */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="relative w-64 h-64 border border-brand-primary/10 rounded-full"
        >
          {/* Internal Swirl of Funds */}
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="absolute inset-4 border border-brand-primary/20 rounded-full border-dashed"
          />
        </motion.div>
      </div>

      {/* The Core Pot */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="w-32 h-32 glass rounded-full flex flex-col items-center justify-center border-2 border-brand-primary/40 shadow-[0_0_50px_rgba(0,255,136,0.15)] z-20"
        >
          <Coins className="text-brand-primary w-8 h-8 mb-1" />
          <span className="text-[10px] font-mono text-brand-primary font-bold uppercase tracking-tighter">Pool Pot</span>
        </motion.div>
      </div>

      {/* Connection SVG Trails */}
      <svg className="absolute inset-0 w-full h-full opacity-40" viewBox="0 0 100 100">
        <defs>
          <linearGradient id="flowGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="50%" stopColor="#00FF88" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
        </defs>

        {participants.map((i) => {
          const a = (i * 60 - 90) * (Math.PI / 180);
          const x2 = 50 + 40 * Math.cos(a);
          const y2 = 50 + 40 * Math.sin(a);
          return (
            <g key={i}>
              <line x1="50" y1="50" x2={x2} y2={y2} stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
              {/* Token flow animations */}
              <circle r="0.8" fill="#00FF88">
                <animateMotion
                  dur={`${2 + i * 0.5}s`}
                  repeatCount="indefinite"
                  path={`M ${x2} ${y2} L 50 50`}
                />
              </circle>
            </g>
          );
        })}
      </svg>

      {/* Participant Ring */}
      {participants.map((i) => (
        <motion.div
          key={i}
          className="absolute inset-0"
          animate={{ rotate: 360 }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
        >
          <div
            className="absolute top-60 left-1/2 -translate-x-1/2 -translate-y-1/2"
            style={{ transform: `rotate(${-i * 60}deg) translateY(-200px)` }}
          >
            <motion.div
              animate={{
                rotate: -360,
                borderColor: ["rgba(255,255,255,0.1)", "rgba(0,255,136,0.5)", "rgba(255,255,255,0.1)"]
              }}
              transition={{
                rotate: { duration: 40, repeat: Infinity, ease: "linear" },
                borderColor: { duration: 3, delay: i * 0.5, repeat: Infinity }
              }}
              className="w-16 h-16 glass rounded-full flex items-center justify-center border border-white/10 relative"
            >
              <Users className="w-6 h-6 text-white/40" />

              {/* Individual Contribution Indicator */}
              <motion.div
                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 2, delay: i * 0.3, repeat: Infinity }}
                className="absolute -top-1 -right-1 w-4 h-4 bg-brand-primary rounded-full flex items-center justify-center shadow-[0_0_10px_#00FF88]"
              >
                <div className="w-1.5 h-1.5 bg-black rounded-full" />
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      ))}

      {/* The "Winner" Highlight Pulse */}
      <motion.div
        animate={{
          rotate: 360,
          scale: [1, 1.05, 1]
        }}
        transition={{
          rotate: { duration: 10, repeat: Infinity, ease: "linear" },
          scale: { duration: 2, repeat: Infinity }
        }}
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
      >
        <div className="w-full h-full border-[1px] border-brand-primary/20 rounded-full border-dashed animate-pulse" />
      </motion.div>

      {/* Round/Cycle Text */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-center pointer-events-none">
        <div className="text-[10px] font-mono text-white/20 uppercase tracking-[0.3em]">Monthly Cycle</div>
        <motion.div
          animate={{ opacity: [0.2, 1, 0.2] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="text-brand-primary font-mono text-xs font-bold"
        >
          ROUND 04 IN PROGRESS
        </motion.div>
      </div>
    </div>
  );
};

const Hero = () => {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 200]);
  const y2 = useTransform(scrollY, [0, 500], [0, -150]);
  const textY = useTransform(scrollY, [0, 500], [0, 100]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);
  const scale = useTransform(scrollY, [0, 500], [1, 0.9]);

  return (
    <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
      {/* Background Parallax Elements */}
      <motion.div style={{ y: y1 }} className="absolute top-1/4 -left-20 w-96 h-96 bg-brand-primary/5 rounded-full blur-[120px]" />
      <motion.div style={{ y: y2 }} className="absolute bottom-1/4 -right-20 w-96 h-96 bg-brand-primary/5 rounded-full blur-[120px]" />

      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center relative z-10">
        <motion.div
          style={{ y: textY, opacity }}
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-brand-primary mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-primary"></span>
            </span>
            POWERED BY CHAINLINK
          </div>
          <h1 className="text-6xl md:text-8xl font-bold leading-[0.9] mb-8">
            THE FUTURE OF <br />
            <span className="text-brand-primary">ROSCA</span> <br />
            YIELD.
          </h1>
          <p className="text-lg text-white/60 max-w-lg mb-10 leading-relaxed">
            Starosca combines the tradition of rotating savings (arisan) with AI-powered yield optimization on Base. Your collateral earns while securing the group.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link href="/pools">
              <Button size="lg" className="text-lg">
                Browse Pools <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Link href="/pools/create">
              <Button variant="outline" size="lg" className="text-lg">
                Create Pool
              </Button>
            </Link>
          </div>

          <div className="mt-16 grid grid-cols-3 gap-8 border-t border-white/10 pt-8">
            <div>
              <div className="text-2xl font-bold font-display">$1.2M+</div>
              <div className="text-xs text-white/40 uppercase tracking-widest mt-1">Collateral Staked</div>
            </div>
            <div>
              <div className="text-2xl font-bold font-display">15.4%</div>
              <div className="text-xs text-white/40 uppercase tracking-widest mt-1">Average APY</div>
            </div>
            <div>
              <div className="text-2xl font-bold font-display">640+</div>
              <div className="text-xs text-white/40 uppercase tracking-widest mt-1">Winners Drawn</div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
          style={{ opacity, scale, y: y2 }}
          className="relative"
        >
          <TechIllustration />
        </motion.div>
      </div>
    </section>
  );
};

const Features = () => {
  const features = [
    {
      icon: <Chip className="w-6 h-6" />,
      title: "AI Yield Optimizer",
      description: "Our AI engine continuously rebalances pool funds into the highest-yielding blue-chip protocols on Base."
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Verifiable Randomness",
      description: "Chainlink VRF ensures every monthly drawing is provably fair and tamper-proof. Anyone can verify the result."
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: "Trustless Automation",
      description: "Smart contracts autonomously handle monthly deadlines, pot distributions, and pool finalization."
    }
  ];

  return (
    <section className="py-32 relative">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-4xl md:text-6xl font-bold mb-6 uppercase">ENGINEERED FOR <span className="text-brand-primary">FAIRNESS</span>.</h2>
          <p className="text-white/60 text-lg">Starosca provides the first robust infrastructure for collateralized rotating savings groups in DeFi.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              whileHover={{ y: -10 }}
              className="glass p-8 rounded-3xl relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-brand-primary/10 transition-colors" />
              <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center mb-6 border border-white/10 text-brand-primary">
                {f.icon}
              </div>
              <h3 className="text-2xl font-bold mb-4">{f.title}</h3>
              <p className="text-white/50 leading-relaxed">{f.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const HorizontalScrollSection = () => {
  const targetRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end end"]
  });

  const xTransform = useTransform(scrollYProgress, [0, 1], ["0%", "-75%"]);
  const x = useSpring(xTransform, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const cards = [
    { title: "VRF v2.5", desc: "Provably fair winner selection every month.", icon: <Shield size={32} /> },
    { title: "Automation", desc: "Trustless triggers for drawings and rebalancing.", icon: <Clock size={32} /> },
    { title: "Data Feeds", desc: "Accurate USDC/ETH pricing for collateral.", icon: <BarChart3 size={32} /> },
    { title: "Functions", desc: "Fetching external APY data from DeFi protocols.", icon: <Search size={32} /> },
    { title: "CCIP", desc: "Cross-chain deposits from any EVM network.", icon: <Globe size={32} /> },
  ];

  return (
    <section ref={targetRef} className="relative h-[300vh] bg-black">
      <div className="sticky top-0 h-screen flex items-center overflow-hidden">
        <div className="absolute top-20 left-6 z-10">
          <h2 className="text-5xl font-bold uppercase mb-2">Powered by <span className="text-brand-primary">Chainlink</span></h2>
          <p className="text-white/40 font-mono">SCROLL TO EXPLORE INTEGRATIONS</p>
        </div>
        <motion.div style={{ x }} className="flex gap-8 px-6">
          {cards.map((card, i) => (
            <div key={i} className="w-[400px] h-[500px] glass rounded-[2rem] p-12 flex flex-col justify-between flex-shrink-0">
              <div className="w-16 h-16 bg-brand-primary/10 rounded-2xl flex items-center justify-center text-brand-primary">
                {card.icon}
              </div>
              <div>
                <h3 className="text-3xl font-bold mb-4 uppercase">{card.title}</h3>
                <p className="text-white/50 leading-relaxed">{card.desc}</p>
              </div>
              <button className="w-fit text-brand-primary font-bold flex items-center gap-2 group cursor-pointer">
                Integration Detail <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

const FlipCard = ({ card }: { card: any }) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  // Rotate from 0 to 180 as it passes the middle of the screen
  const rotateY = useTransform(scrollYProgress, [0.35, 0.5, 0.65], [0, 180, 360]);
  const springRotate = useSpring(rotateY, { stiffness: 40, damping: 20 });

  return (
    <div ref={ref} className="h-[400px] [perspective:1000px]">
      <motion.div
        style={{ rotateY: springRotate }}
        className="relative h-full w-full rounded-3xl [transform-style:preserve-3d]"
      >
        {/* Front */}
        <div className="absolute inset-0 h-full w-full rounded-3xl glass p-10 flex flex-col items-center justify-center [backface-visibility:hidden] border border-white/10">
          <div className="w-20 h-20 bg-brand-primary/10 rounded-full flex items-center justify-center text-brand-primary mb-6">
            {card.icon}
          </div>
          <h3 className="text-3xl font-bold uppercase">{card.front}</h3>
          <p className="mt-4 text-white/30 text-sm font-mono uppercase tracking-widest">Protocol Core</p>
        </div>
        {/* Back */}
        <div className="absolute inset-0 h-full w-full rounded-3xl bg-brand-primary p-10 flex flex-col items-center justify-center text-black [transform:rotateY(180deg)] [backface-visibility:hidden]">
          <h3 className="text-2xl font-bold mb-4 uppercase">{card.front}</h3>
          <p className="text-center font-medium leading-relaxed">{card.back}</p>
        </div>
      </motion.div>
    </div>
  );
};

const FlipCardSection = () => {
  const cards = [
    { front: "Safety", back: "Collateralized models ensure that the group pot is always secure, regardless of participant defaults.", icon: <Shield size={40} /> },
    { front: "Yield", back: "Instead of sitting idle, all contributions earn yield through AI-optimized DeFi strategies.", icon: <Zap size={40} /> },
    { front: "Fairness", back: "Decentralized drawings mean no one can influence who gets paid when. Pure, verifiable luck.", icon: <Layers size={40} /> },
  ];

  return (
    <section className="py-32 bg-white/[0.02]">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-4xl md:text-6xl font-bold mb-20 text-center uppercase">Our <span className="text-brand-primary">Philosophy</span></h2>
        <div className="grid md:grid-cols-3 gap-12">
          {cards.map((card, i) => (
            <FlipCard key={i} card={card} />
          ))}
        </div>
      </div>
    </section>
  );
};

const StickyCardStack = () => {
  const cards = [
    { title: "Step 01: Join Pool", desc: "Deposit USDC collateral + first monthly contribution. Collateral = participants x monthly amount.", color: "bg-white/5" },
    { title: "Step 02: Monthly Pay", desc: "Pay your monthly contribution by the 10th. Funds are deposited into yield protocols.", color: "bg-white/10" },
    { title: "Step 03: The Drawing", desc: "On the 25th, Chainlink VRF randomly selects a winner who receives the full monthly pot.", color: "bg-white/15" },
    { title: "Step 04: Earn & Exit", desc: "At the end of the cycle, get your collateral back + all accumulated yield from the group.", color: "bg-white/20" },
  ];

  return (
    <section className="py-32 px-6">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-4xl md:text-6xl font-bold mb-20 uppercase">How It <span className="text-brand-primary">Works</span></h2>
        <div className="flex flex-col gap-20">
          {cards.map((card, i) => (
            <div key={i} className="sticky top-32 h-[400px]">
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className={cn(
                  "h-full w-full rounded-[3rem] border border-white/10 backdrop-blur-3xl p-12 flex flex-col justify-between",
                  card.color
                )}
              >
                <div className="flex justify-between items-start">
                  <h3 className="text-4xl font-bold uppercase leading-tight max-w-xs">{card.title}</h3>
                  <span className="text-brand-primary font-mono text-xl">0{i + 1}</span>
                </div>
                <div className="flex items-end justify-between">
                  <p className="text-white/60 text-lg max-w-sm">{card.desc}</p>
                  <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center">
                    <ArrowRight className="text-white/40" />
                  </div>
                </div>
              </motion.div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const StickyScrollSection = () => {
  const targetRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end end"]
  });
  const scaleTransform = useTransform(scrollYProgress, [0, 0.5], [1, 0.8]);
  const opacityTransform = useTransform(scrollYProgress, [0, 0.4], [1, 0]);

  const scale = useSpring(scaleTransform, { stiffness: 100, damping: 30 });
  const opacity = useSpring(opacityTransform, { stiffness: 100, damping: 30 });

  return (
    <section ref={targetRef} className="relative h-[200vh]">
      {/* Sticky Background Layer */}
      <div className="sticky top-0 h-screen flex items-center justify-center overflow-hidden bg-black">
        <motion.div
          style={{ scale, opacity }}
          className="text-center px-6"
        >
          <h2 className="text-7xl md:text-9xl font-bold tracking-tighter mb-4 uppercase">
            YIELD <span className="text-brand-primary">ENGINE</span>
          </h2>
          <p className="text-white/40 text-xl font-mono">SCROLL TO EXPLORE THE OPTIMIZER</p>
        </motion.div>

        {/* Decorative elements that stay sticky */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-white/5 rounded-full" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-white/10 rounded-full" />
        </div>
      </div>

      {/* Content that "covers up" the sticky layer */}
      <div className="relative z-10 -mt-[100vh]">
        <div className="h-screen" /> {/* Spacer to let the sticky layer be seen */}

        <div className="bg-bg-dark border-t border-white/10">
          <div className="max-w-7xl mx-auto px-6 py-32">
            <div className="grid md:grid-cols-2 gap-24 items-center">
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                <h3 className="text-5xl font-bold mb-8 uppercase">AI Optimization</h3>
                <p className="text-white/60 text-lg leading-relaxed mb-8">
                  Our YieldManager contract leverages external data through Chainlink Functions to analyze risk-adjusted APY across Aave, Moonwell, and Aerodrome.
                </p>
                <ul className="space-y-4">
                  {['Intelligent Protocol Selection', 'Automated Rebalancing', 'Compounding Rewards'].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-brand-primary font-mono text-sm uppercase">
                      <div className="w-1.5 h-1.5 bg-brand-primary rounded-full" />
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
              <div className="relative aspect-square glass rounded-3xl p-12 flex items-center justify-center overflow-hidden">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                  className="w-full h-full border-2 border-dashed border-white/10 rounded-full flex items-center justify-center"
                >
                  <div className="w-3/4 h-3/4 border-2 border-dashed border-brand-primary/20 rounded-full flex items-center justify-center">
                    <Layers className="w-20 h-20 text-brand-primary opacity-50" />
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const BentoSection = () => {
  return (
    <section className="py-32 bg-white/[0.02]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-3 grid-rows-2 gap-6 h-auto md:h-[600px]">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="md:col-span-2 glass rounded-3xl p-10 flex flex-col justify-between relative overflow-hidden"
          >
            <div className="relative z-10">
              <h3 className="text-3xl font-bold mb-4 uppercase">Chainlink CRE Workflow</h3>
              <p className="text-white/60 max-w-md">Our custom AI Yield Optimizer uses Chainlink's Conditional Runtime Environment to execute rebalancing logic based on market conditions.</p>
            </div>
            <div className="mt-8 flex gap-4 relative z-10">
              <div className="px-4 py-2 bg-brand-primary/10 border border-brand-primary/20 rounded-lg text-brand-primary text-xs font-mono">ANALYSIS</div>
              <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white/40 text-xs font-mono uppercase">DECISION</div>
              <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white/40 text-xs font-mono">EXECUTION</div>
            </div>
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-brand-primary/5 blur-[80px] -mb-32 -mr-32" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="glass rounded-3xl p-10 flex flex-col items-center justify-center text-center"
          >
            <div className="w-20 h-20 bg-brand-primary/10 rounded-full flex items-center justify-center mb-6">
              <Coins className="text-brand-primary w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold mb-2 uppercase">USDC Native</h3>
            <p className="text-white/40 text-sm">Collateral and contributions are all in USDC for maximum stability.</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass rounded-3xl p-10 flex flex-col justify-center"
          >
            <h3 className="text-4xl font-bold text-brand-primary mb-2">100%</h3>
            <p className="text-white/60 text-sm">Transparency. Every transaction and rebalance is visible on-chain.</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="md:col-span-2 glass rounded-3xl p-10 flex items-center justify-between overflow-hidden relative"
          >
            <div className="max-w-xs">
              <h3 className="text-2xl font-bold mb-4 uppercase">Base Layer 2</h3>
              <p className="text-white/50 text-sm">Low-cost transactions and Coinbase-grade security make Base the perfect home for social savings.</p>
            </div>
            <div className="hidden md:block font-mono text-[10px] text-white/20 leading-tight">
              <pre>{`
function onMonthlyCycle() {
  const yield = optimizer.analyze();
  if (yield > current) {
    rebalance(targetProtocol);
  }
}
              `}</pre>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default function Home() {
  return (
    <div className="min-h-screen bg-bg-dark selection:bg-brand-primary selection:text-black">
      <main>
        <Hero />
        <Features />
        <HorizontalScrollSection />
        <FlipCardSection />
        <StickyScrollSection />
        <StickyCardStack />
        <BentoSection />

        {/* Final CTA */}
        <section className="py-32 relative overflow-hidden">
          <div className="absolute inset-0 bg-brand-primary/5 blur-[120px] rounded-full translate-y-1/2" />
          <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
            <h2 className="text-5xl md:text-7xl font-bold mb-8 uppercase">READY TO JOIN THE <span className="text-brand-primary">CIRCLE</span>?</h2>
            <p className="text-white/60 text-xl mb-12 max-w-2xl mx-auto">Start or join a pool today and see how social savings meet DeFi optimization.</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/pools" className="w-full sm:w-auto">
                <Button size="lg" className="w-full text-xl py-5 rounded-full">
                  Explore Pools
                </Button>
              </Link>
              <Link href="/pools/create" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="w-full text-xl py-5 rounded-full">
                  Create Your Pool
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}


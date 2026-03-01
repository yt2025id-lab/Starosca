# Starosca — Pitch Deck
**Convergence: A Chainlink Hackathon | DeFi & Tokenization Track**
Live: starosca.vercel.app · GitHub: github.com/yt2025id-lab/Starosca

---

## Slide 01 — Title

### The Future of ROSCA Yield.

Collateralized ROSCA with AI-Powered Yield Optimization on Base L2 —
trust-minimized savings circles for **3 billion people** worldwide.

- ⬡ 6 Chainlink Products
- ⚡ Live on Base Sepolia
- 🤖 AI Yield Optimizer
- 🌐 Full-Stack DApp

> **🎙 Voiceover:**
> Hello, judges. We're presenting Starosca — a DeFi protocol that transforms traditional savings circles, known as ROSCA, into trustless, yield-generating pools on Base. We integrate 6 Chainlink products to solve real problems faced by 3 billion people who rely on informal savings groups globally.

---

## Slide 02 — The Problem

### Billions use ROSCA. Trust remains the #1 barrier.

Traditional ROSCA (Arisan, Chit Fund, Tontine) has worked for centuries — but it's broken by design.

**⚠️ Default Risk**
After receiving the pot, participants often stop paying. No enforcement exists in traditional ROSCA. The pool collapses.

**💤 Idle Capital**
Pooled funds sit idle earning zero yield. Billions of dollars in savings generate nothing between collection and payout.

**🎰 Unfair Selection**
Drawing order is often rigged by organizers. No verifiable randomness — trust is manual and fragile.

> 💡 ROSCA is called **Arisan** (Indonesia) · **Chit Fund** (India) · **Tontine** (West Africa) · **Tandas** (Mexico) · **Hui** (China/Vietnam) — same concept, **$1 trillion+** annual volume, zero innovation.

> **🎙 Voiceover:**
> ROSCA — Rotating Savings and Credit Associations — is one of the oldest financial instruments in the world. But three fundamental problems remain unsolved: first, default risk, because after winning the pot, members have no incentive to keep paying. Second, idle capital — pooled funds earn zero yield. And third, unfair selection — the winner is chosen by a human organizer with no transparency. These are problems we can fix with blockchain.

---

## Slide 03 — The Solution

### Starosca: Trust-Minimized ROSCA

Three problems. Three blockchain-native solutions.

**🔒 Collateralized Participation**
Each member deposits N × monthly as collateral upfront. Missed payments auto-deduct from collateral. Pool is always solvent — winners are guaranteed their pot.

**🤖 AI Yield Optimization**
All idle funds deployed to DeFi protocols (Aave, Compound, Moonwell). A Chainlink CRE Workflow with GPT-4o-mini rebalances every 4 hours for maximum APY.

**🎲 Provably Fair Drawing**
Chainlink VRF v2.5 generates a verifiable random number on-chain. No human can manipulate the winner. Tamper-proof and transparent.

| Metric | Value |
|---|---|
| Pool Solvency | 100% Guaranteed |
| Yield Generation | 24/7 on Idle Funds |
| Winner Selection | VRF — Provably Fair |

> **🎙 Voiceover:**
> Starosca addresses each problem directly. Default risk is eliminated by requiring full collateral upfront — equal to the number of participants times the monthly contribution. If someone misses a payment, it's automatically deducted from their collateral, keeping the pool always solvent. Idle capital becomes productive through our AI Yield Optimizer, which continuously routes funds to the highest-yielding DeFi protocols. And Chainlink VRF makes winner selection provably fair — no human involvement at all.

---

## Slide 04 — How It Works

### How a ROSCA Pool Works

Simple for users. Powerful under the hood.

**Step 1 — Create Pool**
Set number of members & monthly contribution amount.

**Step 2 — Join + Collateral**
Deposit N × monthly as collateral + 1st payment. Collateral goes to YieldManager → Aave V3 immediately.

**Step 3 — Monthly Pay**
- Day 1–10: on-time payment → yield bonus eligible
- Day 11–24: late payment
- Day 25: VRF drawing

**Step 4 — VRF Drawing**
Chainlink VRF selects winner. Winner receives full pot instantly on-chain.

**Step 5 — Claim & Exit**
After all rounds: collateral returned 100% + yield distributed proportionally based on payment history.

> ✅ **On-Time Bonus:** Pay in days 1–10 → higher yield multiplier at finalization. Incentivizes timely payments.
> 🛡️ **Missed Payment:** Auto-deducted from collateral. Pool never breaks. Winner always receives full pot.

> **🎙 Voiceover:**
> The flow is straightforward. An organizer creates a pool by setting the number of members and monthly amount. Each member joins by depositing their collateral — which immediately starts earning yield on Aave V3 — plus their first monthly contribution. Every month, members pay their contribution. Paying in the first 10 days earns a yield bonus. On day 25, Chainlink VRF selects the winner who receives the full pot. This repeats until every member has won. At the end, everyone gets their collateral back plus their share of yield earned throughout the cycle.

---

## Slide 05 — Chainlink Integration

### 6 Chainlink Products — Deeply Integrated

Each product solves a specific protocol requirement — not just usage for the sake of it.

| # | Product | Role |
|---|---|---|
| ⭐ Mandatory | **CRE Workflow** | AI Yield Optimizer. Cron trigger every 4h → fetch APY data → GPT-4o-mini analysis → auto-rebalance between Aave, Compound, Moonwell. Running on Chainlink DON. |
| #2 | **VRF v2.5** | Verifiable randomness for monthly winner selection. Subscription funded with 25 LINK. Tamper-proof, on-chain verifiable. |
| #3 | **Automation** | Time-based upkeeps for: monthly drawing triggers, payment deadline enforcement, pool finalization after last round. |
| #4 | **Data Feeds** | USDC/USD and ETH/USD price feeds for accurate real-time collateral valuation. Ensures pool solvency in USD terms. |
| #5 | **Functions** | Off-chain APY data fetching from DeFiLlama API. Brings real-world yield data on-chain to inform CRE rebalancing decisions. |
| #6 | **CCIP** | Cross-chain deposits from Ethereum Sepolia & Arbitrum Sepolia into Base Sepolia pools. Participate from any supported chain. |

> **🎙 Voiceover:**
> We integrate 6 Chainlink products — each serving a critical function. CRE Workflow is our core innovation — an autonomous AI yield optimizer running on Chainlink's Decentralized Oracle Network every 4 hours. VRF v2.5 handles provably fair winner selection, funded with 25 LINK. Automation triggers monthly drawings and deadlines. Data Feeds provide accurate collateral valuation. Functions bring off-chain APY data on-chain. And CCIP enables cross-chain participation from Ethereum and Arbitrum. Every integration is purpose-built, not cosmetic.

---

## Slide 06 — CRE Workflow Deep Dive

### CRE Workflow: AI Yield Optimizer

Autonomous yield optimization — no human needed. Runs every 4 hours on Chainlink DON.

**Flow:**
`⏰ Cron Trigger (4h)` → `📊 Fetch APY (DeFiLlama + on-chain)` → `🤖 AI Analysis (GPT-4o-mini)` → `⚖️ Decision (Δ APY > 0.5%)` → `🔄 Rebalance (EVM tx)`

**🧠 AI Evaluates:**
- APY rates across Aave V3, Compound V3, Moonwell
- TVL and liquidity depth
- Protocol risk scores
- Historical APY volatility
- Gas cost vs. yield improvement

**📈 Real Example:**
- Aave V3 current APY: **8.50%**
- Compound V3 detected: **9.20%**
- Delta: **+0.70%** → exceeds 0.5% threshold
- Action: **Auto-rebalance executed on-chain**

> **🎙 Voiceover:**
> The CRE Workflow is our most innovative feature. Every 4 hours, it automatically triggers. It fetches live APY data from DeFiLlama and reads on-chain rates from Aave, Compound, and Moonwell. It then calls GPT-4o-mini through an HTTP action to analyze the data — considering not just APY, but liquidity depth, protocol risk, and gas costs. If the AI determines that moving funds would improve yield by more than 0.5%, it automatically executes an EVM transaction to rebalance. All of this happens autonomously on Chainlink's Decentralized Oracle Network. No admin needed.

---

## Slide 07 — Technical Architecture

### Full-Stack · Production-Ready

Smart contracts, frontend, backend, and CRE workflow — all deployed and integrated.

**Smart Contracts** *(Solidity 0.8.24 · Foundry · EIP-1167)*
- StaroscaFactory
- StaroscaPool (clone via EIP-1167)
- YieldManager
- CrossChainDeposit (CCIP)
- Aave V3, Compound V3, Moonwell Adapters

**Frontend** *(Next.js 16 · wagmi v2 · Vercel)*
- Pool Browser, Create Pool, Join & Pay UI, Dashboard, Claim & Withdraw

**Backend** *(Fastify · viem · TypeScript)*
- Event Indexer, Pool API, Yield Snapshots, SQLite DB, Health Monitor

**CRE Workflow** *(CRE SDK · Bun · GPT-4o-mini)*
- Cron Trigger, HTTP (DeFiLlama), AI Analysis, EVM Execute, DON Consensus

> - EIP-1167 clones → **97% cheaper** pool deployment
> - Singleton YieldManager for capital efficiency
> - Adapter pattern for yield protocol extensibility

> **🎙 Voiceover:**
> The architecture is production-ready across 4 layers. Smart contracts are written in Solidity using Foundry, with EIP-1167 minimal proxy clones that make each new pool 97% cheaper to deploy than a full contract. The frontend is built with Next.js and wagmi, deployed on Vercel. The backend is a Fastify server that indexes events and serves pool data via API. And the CRE Workflow runs on Bun with the Chainlink CRE SDK, orchestrating the AI yield optimizer. All four layers are deployed and integrated.

---

## Slide 08 — Deployed Contracts

### Live on Base Sepolia Testnet

All contracts verified and operational. VRF subscription funded with 25 LINK.

| Contract | Address | Status |
|---|---|---|
| StaroscaFactory | `0x6D59cE9DfC9dB97C8b4EBCF53807b606BB4Ed370` | ● Live |
| YieldManager | `0x994A2065b6C86A9b35366c888C279118b71dc883` | ● Live |
| CrossChainDeposit (CCIP) | `0xc8c914B6a917C7d3A3248d128794fC423DdF4Cc8` | ● Live |
| Aave V3 Adapter | `0x397234Ba99487357Dca71BA2944Ef19c4703Fe6a` | ● Live |
| Compound V3 Adapter | `0xA643f11Fb9f0bd409fbC98aCF8c43dc9Bf7d3D01` | ● Live |
| Moonwell Adapter | `0x54fa989De91903faeFa3E7548B5262144a9fC9Be` | ● Live |

- VRF Subscription ID: `69357068416337207122981154411761423095255322197691197725229998518708741854566`
- VRF Funded: **25 LINK**
- Frontend: **starosca.vercel.app**
- GitHub: **github.com/yt2025id-lab/Starosca**

> **🎙 Voiceover:**
> All 6 contracts are deployed and verified on Base Sepolia. The StaroscaFactory is the entry point — it deploys new pool clones. The YieldManager handles all DeFi interactions through 3 protocol adapters: Aave V3, Compound V3, and Moonwell. CrossChainDeposit enables CCIP cross-chain participation. Our VRF subscription is funded with 25 LINK and ready. The frontend is live at starosca dot vercel dot app. The full codebase is open source on GitHub.

---

## Slide 09 — Market Opportunity

### A Massive Untapped Market

ROSCA is one of the largest informal financial systems in the world — and it's completely unoptimized.

| Metric | Value | Context |
|---|---|---|
| Annual ROSCA Volume | **$1 Trillion+** | Asia, Africa, Latin America, Middle East |
| People Using Savings Circles | **3 Billion+** | Often unbanked or underbanked |
| Yield on Traditional ROSCA | **0%** | Every idle dollar earns nothing |

**Same concept, many names:**
- 🇮🇩 **Arisan** — Indonesia (270M people)
- 🇮🇳 **Chit Fund** — India ($70B/yr)
- 🌍 **Tontine** — West Africa
- 🇲🇽 **Tandas** — Mexico
- 🇨🇳 **Hui** — China/Vietnam
- 🇪🇬 **Gameya** — Egypt
- 🇵🇭 **Paluwagan** — Philippines

**One protocol** to serve them all — on any chain, in any token.

> **🎙 Voiceover:**
> The market opportunity is enormous. Over one trillion dollars flows through informal ROSCA groups every year. More than 3 billion people rely on these savings circles — often because they lack access to traditional banking. And currently, all of that capital earns zero yield. Starosca captures this entire market with one protocol. Whether it's called Arisan in Indonesia, Chit Fund in India, or Tontine in West Africa — same concept, same problems, one solution. And because we're built on Base with CCIP, we can serve these communities across any blockchain.

---

## Slide 10 — Why Starosca Wins

### Built to Win This Hackathon

Deep Chainlink integration, real-world impact, and complete delivery.

✓ **6 Chainlink integrations** — deepest integration in the DeFi track. CRE (mandatory) + VRF + Automation + Data Feeds + Functions + CCIP, all purpose-built.

✓ **Real-world problem** — solving actual pain points for 3B+ ROSCA users. Not a toy project — a usable protocol.

✓ **AI-powered CRE** — autonomous GPT-4o-mini yield optimization running on Chainlink DON every 4 hours. No human needed.

✓ **Full-stack delivery** — contracts + frontend + backend + CRE workflow. All deployed, all integrated, all working.

✓ **Cross-chain ready** — CCIP allows deposits from Ethereum and Arbitrum into Base pools.

✓ **Gas optimized** — EIP-1167 minimal proxy clones reduce pool deployment cost by 97%.

**Target Prize: $20,000** — 1st Place · DeFi & Tokenization Track
*Convergence: A Chainlink Hackathon · Feb 6 – Mar 1, 2026*

> **🎙 Voiceover:**
> Why should Starosca win? Six reasons. First, depth of Chainlink integration — we use all 6 products in meaningful ways, not just for show. Second, real-world impact — this protocol serves billions of actual users, not a hypothetical use case. Third, the CRE AI Yield Optimizer is genuinely novel — autonomous, AI-driven rebalancing on Chainlink's DON. Fourth, we have complete delivery — every layer is deployed and working. Fifth, cross-chain capability via CCIP. And sixth, gas optimization through EIP-1167 clones making pool deployment 97% cheaper. We believe this is the strongest submission in the DeFi track.

---

## Slide 11 — Thank You

### Starosca

Transforming traditional savings circles into trustless, yield-generating DeFi pools — for everyone, everywhere.

| | |
|---|---|
| Live Demo | starosca.vercel.app |
| GitHub | github.com/yt2025id-lab/Starosca |
| Network | Base Sepolia Testnet |

**Chainlink Products Used:**
`CRE Workflow` · `VRF v2.5` · `Automation` · `Data Feeds` · `Functions` · `CCIP`

> **🎙 Voiceover:**
> Thank you, judges. Starosca is our vision for the future of ROSCA — a system that has served billions of people for centuries, now made trustless, fair, and yield-generating through the power of Chainlink. You can try the live app at starosca dot vercel dot app, review our code on GitHub, and interact with our deployed contracts on Base Sepolia. We're excited for your questions. Thank you.

---

*Starosca · Convergence: A Chainlink Hackathon 2026*

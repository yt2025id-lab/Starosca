<div align="center">

<img src="https://img.shields.io/badge/Chainlink-Convergence_Hackathon_2026-375BD2?style=for-the-badge&logo=chainlink&logoColor=white" />
<img src="https://img.shields.io/badge/Track-DeFi_%26_Tokenization-00e676?style=for-the-badge" />
<img src="https://img.shields.io/badge/Network-Base_Sepolia-0052FF?style=for-the-badge&logo=coinbase&logoColor=white" />
<img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" />

<br /><br />

```
  ███████╗████████╗ █████╗ ██████╗  ██████╗ ███████╗ ██████╗ █████╗
  ██╔════╝╚══██╔══╝██╔══██╗██╔══██╗██╔═══██╗██╔════╝██╔════╝██╔══██╗
  ███████╗   ██║   ███████║██████╔╝██║   ██║███████╗██║     ███████║
  ╚════██║   ██║   ██╔══██║██╔══██╗██║   ██║╚════██║██║     ██╔══██║
  ███████║   ██║   ██║  ██║██║  ██║╚██████╔╝███████║╚██████╗██║  ██║
  ╚══════╝   ╚═╝   ╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝ ╚══════╝ ╚═════╝╚═╝  ╚═╝
```

### **Collateralized ROSCA · AI Yield Optimization · Built on Base with Chainlink**

*Transforming a $1 trillion informal savings system trusted by 3 billion people into a trustless, yield-generating DeFi protocol.*

<br />

[![Live Demo](https://img.shields.io/badge/▶_Live_Demo-starosca.vercel.app-00e676?style=for-the-badge)](https://starosca.vercel.app)
[![GitHub](https://img.shields.io/badge/GitHub-yt2025id--lab%2FStarosca-181717?style=for-the-badge&logo=github)](https://github.com/yt2025id-lab/Starosca)

</div>

---

## Table of Contents

- [The Problem](#the-problem)
- [The Solution](#the-solution)
- [Chainlink Integrations](#chainlink-integrations)
- [Architecture](#architecture)
- [Deployed Contracts](#deployed-contracts-base-sepolia)
- [Pool Lifecycle](#pool-lifecycle)
- [Yield Distribution](#yield-distribution)
- [Getting Started](#getting-started)
- [Tech Stack](#tech-stack)

---

## The Problem

**ROSCA** (Rotating Savings and Credit Association) is one of humanity's oldest financial instruments — known as *Arisan* in Indonesia, *Chit Fund* in India, *Tontine* in West Africa, *Tandas* in Mexico, *Hui* in China. **Over $1 trillion** flows through these informal groups annually, used by **3+ billion people** worldwide.

Yet every ROSCA group today suffers from three fundamental, unsolved flaws:

| Problem | Impact |
|---|---|
| 🚨 **Default Risk** | Members who already won the pot stop paying — no enforcement, pool collapses |
| 💤 **Idle Capital** | Pooled funds earn **0% yield** between collection and payout — billions wasted |
| 🎰 **Unfair Selection** | The winner is hand-picked by organizers — no verifiable randomness, manipulation is common |

These are not edge cases. They are structural failures that traditional ROSCA cannot fix — **but blockchain can.**

---

## The Solution

Starosca rebuilds ROSCA from first principles using smart contracts, Chainlink, and AI:

```
Traditional ROSCA                     Starosca
─────────────────────────             ─────────────────────────────────────
Trust in organizer          ──►       Smart contract enforces all rules
No collateral enforcement   ──►       Full collateral locked upfront
Idle pooled funds           ──►       Funds deployed to DeFi yield protocols
Manual winner selection     ──►       Chainlink VRF — provably fair, on-chain
Single-chain only           ──►       Cross-chain via Chainlink CCIP
```

### How It Works

**1. Create a Pool**
An organizer deploys a new ROSCA pool via `StaroscaFactory` (EIP-1167 clone). Sets participant count, monthly contribution, and duration.

**2. Join with Collateral**
Each member deposits **collateral = N participants × monthly amount** + first month's contribution in USDC. Collateral is immediately routed to the highest-yielding DeFi protocol via `YieldManager`.

**3. Monthly Contributions**
Every month, members submit their contribution within the payment window:
- **Days 1–10**: On-time → eligible for yield bonus multiplier
- **Days 11–24**: Late → no yield bonus
- **Missed**: Auto-deducted from collateral — pool remains solvent, winner always guaranteed

**4. Chainlink VRF Drawing**
On day 25, `requestDrawing()` triggers Chainlink VRF v2.5. The random number is returned to `fulfillRandomWords()`, which selects the winner and transfers the full pot instantly.

**5. AI Yield Optimization (CRE Workflow)**
Every 4 hours, a Chainlink CRE Workflow runs AI analysis on all yield protocols. If a better opportunity is found (Δ APY > 0.5%), funds are automatically rebalanced on-chain — no human required.

**6. Claim & Exit**
After all rounds complete, any member can finalize the pool. Each participant claims:
- 100% of remaining collateral
- Collateral yield (time-weighted DeFi returns)
- Contribution yield bonus (on-time payment rewards)

---

## Chainlink Integrations

Starosca integrates **6 Chainlink products** — each solving a specific, non-cosmetic protocol requirement.

| # | Product | Role in Starosca | Key File |
|---|---------|-----------------|---------|
| ⭐ | **CRE Workflow** *(Mandatory)* | AI Yield Optimizer — autonomous 4h cron cycle: fetch APY → AI analysis → on-chain rebalance | [`cre/src/workflows/yield-optimizer/workflow.ts`](cre/src/workflows/yield-optimizer/workflow.ts) |
| 2 | **VRF v2.5** | Verifiable random winner selection — provably fair, tamper-proof drawing on day 25 | [`contracts/src/StaroscaFactory.sol`](contracts/src/StaroscaFactory.sol) |
| 3 | **Automation** | Time-based upkeeps for monthly drawing triggers, deadline enforcement, pool finalization | [`contracts/src/StaroscaPool.sol`](contracts/src/StaroscaPool.sol) |
| 4 | **Data Feeds** | USDC/USD & ETH/USD price feeds for real-time collateral valuation | [`contracts/src/StaroscaFactory.sol`](contracts/src/StaroscaFactory.sol) |
| 5 | **Functions** | Off-chain APY data fetching from DeFiLlama API — brings real-world yield data on-chain | [`cre/src/workflows/yield-optimizer/workflow.ts`](cre/src/workflows/yield-optimizer/workflow.ts) |
| 6 | **CCIP** | Cross-chain deposits — join Base pools from Ethereum Sepolia or Arbitrum Sepolia | [`contracts/src/CrossChainDeposit.sol`](contracts/src/CrossChainDeposit.sol) |

---

### CRE Workflow — AI Yield Optimizer (Deep Dive)

The **CRE Workflow** is Starosca's core innovation. It runs fully autonomously on Chainlink's Decentralized Oracle Network — no centralized server, no human intervention.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    CRE WORKFLOW — Every 4 Hours                         │
│                    Running on Chainlink DON                             │
└─────────────────────────────────────────────────────────────────────────┘

  ┌──────────────┐     ┌──────────────────────┐     ┌─────────────────────┐
  │  Cron Trigger │────▶│  fetchAPYData         │────▶│  analyzeYieldWithAI │
  │  Every 4h    │     │                      │     │                     │
  └──────────────┘     │  • DeFiLlama API     │     │  GPT-4o-mini prompt:│
                       │  • Aave V3 on-chain  │     │  • APY comparison   │
                       │  • Compound V3       │     │  • TVL & liquidity  │
                       │  • Moonwell          │     │  • Protocol risk    │
                       └──────────────────────┘     │  • Gas cost vs gain │
                                                     └──────────┬──────────┘
                                                                │
                                              Δ APY > 0.5%?    │
                                                    ┌───────────┘
                                                    ▼
                                     ┌──────────────────────────┐
                                     │  executeRebalance        │
                                     │                          │
                                     │  YieldManager.rebalance()│
                                     │  → withdraw from old     │
                                     │  → deposit to new        │
                                     │  → emit RebalanceEvent   │
                                     └──────────────────────────┘
```

**AI Decision Factors:**
- Raw APY across all supported protocols
- TVL depth (liquidity risk assessment)
- Protocol risk scores (audit history, TVL stability)
- 7-day APY volatility (avoid chasing spikes)
- Estimated gas cost vs. projected yield improvement
- Rebalance only when net benefit exceeds 0.5% APY threshold

---

### VRF v2.5 Integration

```solidity
// StaroscaFactory.sol — VRF Consumer
function requestDrawing(address pool) external returns (uint256 requestId) {
    requestId = i_vrfCoordinator.requestRandomWords(
        VRFV2PlusClient.RandomWordsRequest({
            keyHash: i_keyHash,
            subId: i_subscriptionId,
            requestConfirmations: 3,
            callbackGasLimit: 200_000,
            numWords: 1,
            extraArgs: VRFV2PlusClient._argsToBytes(
                VRFV2PlusClient.ExtraArgsV1({ nativePayment: false })
            )
        })
    );
    s_requestToPool[requestId] = pool;
}

function fulfillRandomWords(uint256 requestId, uint256[] calldata randomWords) internal override {
    address pool = s_requestToPool[requestId];
    IStaroscaPool(pool).selectWinner(randomWords[0]);
}
```

**VRF Subscription:** `69357068416337207122981154411761423095255322197691197725229998518708741854566`
**Funded:** 25 LINK · **Coordinator:** `0x5C210eF41CD1a72de73bF76eC39637bB0d3d7BEE`

---

## Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              STAROSCA SYSTEM                                │
├──────────────┬──────────────┬──────────────────┬──────────────────────────┤
│   FRONTEND   │   BACKEND    │  SMART CONTRACTS  │      CHAINLINK           │
│  Next.js 16  │   Fastify    │    Base Sepolia   │       SERVICES           │
│  wagmi v2    │   SQLite     │                   │                          │
│  Vercel      │   viem       │  StaroscaFactory  │  ┌─ CRE Workflow (4h)   │
│              │              │  StaroscaPool     │  ├─ VRF v2.5             │
│  Pools UI    │  EventIndexer│  YieldManager     │  ├─ Automation           │
│  Create Pool │  Pool API    │  CrossChainDeposit│  ├─ Data Feeds           │
│  Dashboard   │  Yields API  │                   │  ├─ Functions            │
│  Claim UI    │  Health API  │  ┌ AaveV3Adapter  │  └─ CCIP                 │
│              │              │  ├ CompoundAdapter│                          │
│              │              │  └ MoonwellAdapter│                          │
└──────────────┴──────────────┴──────────────────┴──────────────────────────┘
```

### Smart Contracts

```
contracts/src/
├── StaroscaFactory.sol         # EIP-1167 clone factory + VRF coordinator + Automation
├── StaroscaPool.sol            # Core ROSCA logic: join, pay, draw, finalize, claim
├── YieldManager.sol            # Singleton yield router + per-pool accounting
├── CrossChainDeposit.sol       # CCIP receiver for cross-chain participation
├── adapters/
│   ├── AaveV3Adapter.sol       # Aave V3 supply/withdraw adapter
│   ├── CompoundV3Adapter.sol   # Compound V3 adapter
│   └── MoonwellAdapter.sol     # Moonwell adapter
├── interfaces/
│   ├── IStaroscaPool.sol
│   ├── IYieldManager.sol
│   └── IYieldAdapter.sol       # Extensible adapter interface
└── libraries/
    ├── StaroscaTypes.sol        # Shared structs, enums, events
    ├── TimeLib.sol              # Payment window helpers
    └── YieldMath.sol            # Time-weighted yield distribution math
```

**Key Design Decisions:**

| Decision | Rationale |
|---|---|
| **EIP-1167 Minimal Proxy Clones** | Pool deployment costs ~45K gas vs ~2–4M for full deploy — **97% cheaper** |
| **Singleton YieldManager** | Aggregates all pool deposits for efficient protocol-level yield management |
| **Adapter Pattern** (`IYieldAdapter`) | Hot-swappable yield protocols — add new protocols without redeploying pools |
| **AutomationCompatible** | Pools implement Chainlink Automation for trustless, permissionless monthly execution |
| **Collateral = N × Monthly** | Guarantees 100% pool solvency regardless of member defaults |

### Frontend

```
web/src/app/
├── page.tsx                    # Landing page
├── pools/
│   ├── page.tsx                # Browse & filter all pools
│   ├── create/page.tsx         # Create new pool
│   └── [address]/
│       ├── page.tsx            # Pool detail, join, participant list
│       └── drawing/page.tsx    # Live VRF drawing view + countdown
└── dashboard/
    ├── page.tsx                # My pools overview
    └── claim/page.tsx          # Claim yield distribution
```

**Stack:** Next.js 16 · TailwindCSS · wagmi v2 · viem · WalletConnect · Vercel

### Backend

```
server/src/
├── index.ts                    # Fastify server entry point
├── db/schema.ts                # SQLite schema (pools, participants, payments, drawings)
├── indexer/EventIndexer.ts     # On-chain event polling & indexing
└── api/routes/
    ├── pools.ts                # Pool listing, detail, participants, payments
    ├── yields.ts               # Yield snapshots & optimizer status
    └── health.ts               # Health check
```

**Stack:** Fastify · better-sqlite3 · viem · TypeScript

### CRE Workflow

```
cre/src/
├── workflows/yield-optimizer/
│   ├── workflow.ts             # Main CRE workflow: trigger → fetch → AI → rebalance
│   └── config.json             # Workflow metadata & DON configuration
└── config/protocols.ts         # Protocol addresses & DeFiLlama API endpoints
```

**Stack:** TypeScript · @chainlink/cre-sdk · Bun runtime · GPT-4o-mini

---

## Deployed Contracts (Base Sepolia)

| Contract | Address | Explorer |
|---|---|---|
| **StaroscaFactory** | `0x6D59cE9DfC9dB97C8b4EBCF53807b606BB4Ed370` | [BaseScan ↗](https://sepolia.basescan.org/address/0x6D59cE9DfC9dB97C8b4EBCF53807b606BB4Ed370) |
| **YieldManager** | `0x994A2065b6C86A9b35366c888C279118b71dc883` | [BaseScan ↗](https://sepolia.basescan.org/address/0x994A2065b6C86A9b35366c888C279118b71dc883) |
| **CrossChainDeposit** | `0xc8c914B6a917C7d3A3248d128794fC423DdF4Cc8` | [BaseScan ↗](https://sepolia.basescan.org/address/0xc8c914B6a917C7d3A3248d128794fC423DdF4Cc8) |
| **Aave V3 Adapter** | `0x397234Ba99487357Dca71BA2944Ef19c4703Fe6a` | [BaseScan ↗](https://sepolia.basescan.org/address/0x397234Ba99487357Dca71BA2944Ef19c4703Fe6a) |
| **Compound V3 Adapter** | `0xA643f11Fb9f0bd409fbC98aCF8c43dc9Bf7d3D01` | [BaseScan ↗](https://sepolia.basescan.org/address/0xA643f11Fb9f0bd409fbC98aCF8c43dc9Bf7d3D01) |
| **Moonwell Adapter** | `0x54fa989De91903faeFa3E7548B5262144a9fC9Be` | [BaseScan ↗](https://sepolia.basescan.org/address/0x54fa989De91903faeFa3E7548B5262144a9fC9Be) |

**Chainlink Service Addresses (Base Sepolia):**

| Service | Address |
|---|---|
| VRF Coordinator v2.5 | `0x5C210eF41CD1a72de73bF76eC39637bB0d3d7BEE` |
| USDC/USD Data Feed | `0xd30e2101a97dcbAeBCBC04F14C3f624E67A35165` |
| ETH/USD Data Feed | `0x4ADC67d868f2c653b1AE0d5F5C6d0fF2B2543F43` |
| CCIP Router | `0xD3b06cEbF099CE7DA4AcCf578aaebFDBd6e88a93` |
| Functions Router | `0xf9B8fc078197181C841c296C876945aaa425B278` |

---

## Pool Lifecycle

```
  FACTORY.createPool()
        │
        ▼
  ┌─────────────┐    All N members join     ┌─────────────┐
  │   PENDING   │ ─────────────────────────▶│   ACTIVE    │
  └─────────────┘                           └──────┬──────┘
                                                   │
                                    ┌──────────────┴──────────────┐
                                    │     Monthly Cycle (×N)      │
                                    │                             │
                                    │  Day 1–10:  payContribution │
                                    │  Day 11–24: payContribution │
                                    │             (late, no bonus)│
                                    │  Day 25:    requestDrawing()│
                                    │             → VRF → winner  │
                                    └──────────────┬──────────────┘
                                                   │ (last round done)
                                                   ▼
                                           ┌──────────────┐
                                           │  COMPLETED   │
                                           └──────┬───────┘
                                                  │ finalizePool()
                                                  ▼
                                           ┌──────────────┐
                                           │  FINALIZED   │
                                           └──────┬───────┘
                                                  │ claim() per member
                                                  ▼
                                    collateral + yield distributed ✓

  Payment Windows:
  ┌───────────────┬───────────────┬─────────────────────────┐
  │  Day  1 – 10  │  Day 11 – 24  │  Day 25+                │
  │  ON-TIME ✓    │  LATE         │  DRAWING / NEXT ROUND   │
  │  + yield bonus│  no bonus     │  missed = auto-deducted  │
  └───────────────┴───────────────┴─────────────────────────┘
```

---

## Yield Distribution

At finalization, each participant's claim is calculated as:

```
Total Claim = Remaining Collateral
            + Collateral Yield
            + Contribution Yield
```

| Component | Calculation |
|---|---|
| **Remaining Collateral** | `initialCollateral - missedPaymentDeductions` |
| **Collateral Yield** | `totalYield × 60% × (memberTimeWeightedCollateral / sumAllTimeWeightedCollateral)` |
| **Contribution Yield** | `totalYield × 40% × (memberOnTimeDays / sumAllOnTimeDays)` |

**Incentive Design:**
- Members who **never miss a payment** receive full collateral back + maximum yield share
- Members who **always pay on time** (days 1–10) maximize their contribution yield bonus
- Members who **miss payments** have deductions auto-applied — pool remains solvent

---

## Getting Started

### Prerequisites

- [Foundry](https://book.getfoundry.sh/getting-started/installation) — smart contracts
- Node.js ≥ 20
- [Bun](https://bun.sh/) — CRE workflow runtime

### 1. Smart Contracts

```bash
cd contracts
forge install
forge build
forge test

# Deploy to Base Sepolia
forge script script/Deploy.s.sol --rpc-url $BASE_SEPOLIA_RPC_URL --broadcast

# Set up VRF subscription
forge script script/CreateVRFSub.s.sol:CreateVRFSub --rpc-url $BASE_SEPOLIA_RPC_URL --broadcast
forge script script/CreateVRFSub.s.sol:FundVRFSub   --rpc-url $BASE_SEPOLIA_RPC_URL --broadcast
forge script script/CreateVRFSub.s.sol:AddVRFConsumer --rpc-url $BASE_SEPOLIA_RPC_URL --broadcast
```

### 2. Backend

```bash
cd server
npm install
cp .env.example .env   # add RPC URL + contract addresses
npm run dev            # starts on :3001
```

### 3. Frontend

```bash
cd web
npm install
cp .env.example .env.local   # add WalletConnect project ID
npm run dev                  # starts on :3000
```

### 4. CRE Workflow

```bash
cd cre
bun install
bun run src/workflows/yield-optimizer/workflow.ts
```

### Environment Variables

```bash
# contracts/.env
DEPLOYER_PRIVATE_KEY=
BASE_SEPOLIA_RPC_URL=
VRF_SUBSCRIPTION_ID=69357068416337207122981154411761423095255322197691197725229998518708741854566

# web/.env.local
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=
NEXT_PUBLIC_FACTORY_ADDRESS=0x6D59cE9DfC9dB97C8b4EBCF53807b606BB4Ed370
NEXT_PUBLIC_YIELD_MANAGER_ADDRESS=0x994A2065b6C86A9b35366c888C279118b71dc883

# server/.env
PORT=3001
BASE_SEPOLIA_RPC_URL=
FACTORY_ADDRESS=0x6D59cE9DfC9dB97C8b4EBCF53807b606BB4Ed370
```

---

## Submission Materials

The [`submission/`](submission/) folder contains all hackathon presentation materials:

| File | Contents |
|---|---|
| [`submission/pitch-deck.md`](submission/pitch-deck.md) | 11-slide pitch deck with speaker notes |
| [`submission/demo-script.md`](submission/demo-script.md) | 5-minute video demo script with voiceover |
| [`submission/demo-live.md`](submission/demo-live.md) | Live demo voiceover synced per stage |
| [`demo-live.html`](demo-live.html) | Interactive auto-play demo (open in browser) |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Smart Contracts | Solidity 0.8.24 · Foundry · OpenZeppelin · Chainlink |
| Frontend | Next.js 16 · TailwindCSS · wagmi v2 · viem · WalletConnect |
| Backend | Fastify · better-sqlite3 · viem · TypeScript |
| CRE Workflow | TypeScript · @chainlink/cre-sdk · Bun · GPT-4o-mini |
| Blockchain | Base Sepolia (L2 on Ethereum) |
| Deployment | Vercel (frontend) · Base Sepolia (contracts) |

---

## Why Starosca

| Criterion | Starosca |
|---|---|
| Chainlink Depth | 6 products — CRE (mandatory) + VRF + Automation + Data Feeds + Functions + CCIP |
| Real-World Impact | Serves $1T+ annual ROSCA market, 3B+ users, globally recognized savings mechanism |
| Innovation | First AI-driven ROSCA on-chain; CRE Workflow with GPT-4o-mini yield optimization |
| Completeness | Smart contracts + frontend + backend + CRE workflow — all deployed, all integrated |
| Cross-Chain | CCIP enables participation from Ethereum, Arbitrum, and any CCIP-supported chain |
| Gas Efficiency | EIP-1167 clones reduce pool deployment gas by **97%** |

---

<div align="center">

**Built for Convergence: A Chainlink Hackathon 2026**

*DeFi & Tokenization Track · Feb 6 – Mar 1, 2026*

[![Live App](https://img.shields.io/badge/Try_It_Live-starosca.vercel.app-00e676?style=for-the-badge)](https://starosca.vercel.app)

</div>

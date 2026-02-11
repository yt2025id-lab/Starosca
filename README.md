# Starosca

**Collateralized ROSCA with AI-Powered Yield Optimization on Base**

> A DeFi protocol that modernizes traditional rotating savings circles (ROSCA/arisan) with blockchain guarantees, Chainlink-powered automation, and AI-optimized yield generation.

Built for **Convergence: A Chainlink Hackathon** | Track: **DeFi & Tokenization**

---

## What is Starosca?

Starosca combines the time-tested concept of **ROSCA** (Rotating Savings and Credit Association) — known as *arisan* in Indonesia — with DeFi yield optimization. Participants pool monthly USDC contributions, and each month one member receives the full pot via **Chainlink VRF** random drawing. Idle funds earn yield through AI-optimized DeFi protocol selection.

### How It Works

1. **Create a Pool** — Set the number of participants and monthly contribution amount
2. **Join with Collateral** — Deposit collateral (participants × monthly contribution) + first month's payment in USDC
3. **Monthly Payments** — Pay on-time (days 1-10) for yield bonus, or late (days 11-24)
4. **Random Drawing** — On the 25th of each month, Chainlink VRF selects a winner who receives the full pot
5. **Finalization** — After all drawings, remaining collateral + accrued yield is distributed proportionally
6. **Missed Payments** — Collateral is deducted, ensuring the pool always has enough to pay winners

### Yield Optimization

A **Chainlink CRE Workflow** runs every 4 hours to:
- Fetch APY rates from Aave V3, Compound V3, and Moonwell on Base
- Analyze yields using AI (GPT-4o-mini) considering APY, TVL, risk, and trends
- Automatically rebalance deposits to the highest-yielding protocol when improvement exceeds 0.5%

---

## Chainlink Integrations

Starosca integrates **6 Chainlink products**:

| # | Product | Usage | Key File |
|---|---------|-------|----------|
| 1 | **CRE Workflow** | AI Yield Optimizer — fetches APY, analyzes with AI, executes rebalancing on-chain | [`cre/src/workflows/yield-optimizer/workflow.ts`](cre/src/workflows/yield-optimizer/workflow.ts) |
| 2 | **VRF v2.5** | Verifiable random drawing — selects monthly winner with provable fairness | [`contracts/src/StaroscaFactory.sol`](contracts/src/StaroscaFactory.sol) |
| 3 | **Automation** | Time-based triggers for monthly drawings, deadline enforcement, pool finalization | [`contracts/src/StaroscaPool.sol`](contracts/src/StaroscaPool.sol) |
| 4 | **Data Feeds** | USDC/USD and ETH/USD price feeds for collateral verification and gas estimation | [`contracts/src/StaroscaFactory.sol`](contracts/src/StaroscaFactory.sol) |
| 5 | **Functions** | Off-chain APY data fetching from DeFiLlama and protocol APIs for CRE workflow | [`cre/src/workflows/yield-optimizer/workflow.ts`](cre/src/workflows/yield-optimizer/workflow.ts) |
| 6 | **CCIP** | Cross-chain deposits — join pools or make payments from Ethereum, Arbitrum, etc. | [`contracts/src/CrossChainDeposit.sol`](contracts/src/CrossChainDeposit.sol) |

### CRE Workflow Architecture

```
Trigger (Cron: every 4 hours)
    |
    v
[fetchAPYData] -----> DeFiLlama API + On-chain adapter reads
    |
    v
[analyzeYieldWithAI] --> OpenAI GPT-4o-mini analysis
    |                     (considers APY, TVL, risk, trends)
    v
[executeRebalance] ----> YieldManager.rebalance() on-chain
    |                     (only if improvement > 0.5%)
    v
Done — yields optimized across all active pools
```

---

## Architecture

### Smart Contracts

```
contracts/src/
├── StaroscaFactory.sol       # EIP-1167 clone factory + VRF coordinator
├── StaroscaPool.sol          # Core ROSCA logic (join, pay, draw, finalize, claim)
├── YieldManager.sol          # Singleton yield routing + per-pool accounting
├── CrossChainDeposit.sol     # CCIP receiver for cross-chain participation
├── adapters/
│   ├── AaveV3Adapter.sol     # Aave V3 yield adapter
│   ├── CompoundV3Adapter.sol # Compound V3 yield adapter
│   └── MoonwellAdapter.sol   # Moonwell yield adapter
├── interfaces/
│   ├── IStaroscaPool.sol
│   ├── IYieldManager.sol
│   └── IYieldAdapter.sol
└── libraries/
    ├── StaroscaTypes.sol     # Shared structs, enums, events
    ├── TimeLib.sol           # Date/time & payment window helpers
    └── YieldMath.sol         # Time-weighted yield distribution math
```

**Key Design Decisions:**
- **EIP-1167 Minimal Proxy Clones** — Pool deployment costs ~45K gas vs ~2-4M for full deployment
- **Singleton YieldManager** — All pool deposits aggregated for efficient yield management
- **Adapter Pattern** — Hot-swappable yield protocols via `IYieldAdapter` interface
- **AutomationCompatible** — Pools implement Chainlink Automation for trustless monthly execution

### Frontend

```
web/src/app/
├── page.tsx                  # Landing page
├── pools/
│   ├── page.tsx              # Browse & filter pools
│   ├── create/page.tsx       # Create new pool
│   └── [address]/
│       ├── page.tsx          # Pool detail + join
│       ├── pay/page.tsx      # Monthly payment
│       └── drawing/page.tsx  # Drawing view + countdown
└── dashboard/
    ├── page.tsx              # My pools overview
    └── claim/page.tsx        # Claim yield distribution
```

**Stack:** Next.js 14 (App Router), TailwindCSS, shadcn/ui, wagmi v2, viem, RainbowKit

### Backend

```
server/src/
├── index.ts                  # Fastify server entry
├── db/schema.ts              # SQLite schema (pools, participants, payments, drawings)
├── indexer/EventIndexer.ts   # On-chain event polling & indexing
└── api/routes/
    ├── pools.ts              # Pool listing, detail, participants, payments
    ├── yields.ts             # Yield snapshots & indexer status
    └── health.ts             # Health check endpoint
```

**Stack:** Fastify, better-sqlite3, viem (event indexing)

### CRE Workflow

```
cre/src/
├── workflows/yield-optimizer/
│   ├── workflow.ts           # Main CRE workflow definition
│   └── config.json           # Workflow metadata
└── config/protocols.ts       # Protocol addresses & API endpoints
```

**Stack:** TypeScript, @chainlink/cre-sdk, Bun runtime

---

## Deployed Contracts (Base Sepolia)

| Contract | Address |
|----------|---------|
| StaroscaFactory | [`0x6D59cE9DfC9dB97C8b4EBCF53807b606BB4Ed370`](https://sepolia.basescan.org/address/0x6D59cE9DfC9dB97C8b4EBCF53807b606BB4Ed370) |
| YieldManager | [`0x994A2065b6C86A9b35366c888C279118b71dc883`](https://sepolia.basescan.org/address/0x994A2065b6C86A9b35366c888C279118b71dc883) |
| CrossChainDeposit | [`0xc8c914B6a917C7d3A3248d128794fC423DdF4Cc8`](https://sepolia.basescan.org/address/0xc8c914B6a917C7d3A3248d128794fC423DdF4Cc8) |
| Mock Aave Adapter | [`0x397234Ba99487357Dca71BA2944Ef19c4703Fe6a`](https://sepolia.basescan.org/address/0x397234Ba99487357Dca71BA2944Ef19c4703Fe6a) |
| Mock Compound Adapter | [`0xA643f11Fb9f0bd409fbC98aCF8c43dc9Bf7d3D01`](https://sepolia.basescan.org/address/0xA643f11Fb9f0bd409fbC98aCF8c43dc9Bf7d3D01) |
| Mock Moonwell Adapter | [`0x54fa989De91903faeFa3E7548B5262144a9fC9Be`](https://sepolia.basescan.org/address/0x54fa989De91903faeFa3E7548B5262144a9fC9Be) |

**Chainlink Services Used:**
- VRF Coordinator v2.5: `0x5C210eF41CD1a72de73bF76eC39637bB0d3d7BEE`
- USDC/USD Data Feed: `0xd30e2101a97dcbAeBCBC04F14C3f624E67A35165`
- ETH/USD Data Feed: `0x4ADC67d868f2c653b1AE0d5F5C6d0fF2B2543F43`
- CCIP Router: `0xD3b06cEbF099CE7DA4AcCf578aaebFDBd6e88a93`
- Functions Router: `0xf9B8fc078197181C841c296C876945aaa425B278`

---

## Getting Started

### Prerequisites

- [Foundry](https://book.getfoundry.sh/getting-started/installation) (for smart contracts)
- [Node.js](https://nodejs.org/) >= 18
- [Bun](https://bun.sh/) (for CRE workflow)

### Smart Contracts

```bash
cd contracts
forge install
forge build
forge test
```

### Frontend

```bash
cd web
npm install
cp .env.example .env.local
npm run dev
```

### Backend

```bash
cd server
npm install
cp .env.example .env
npm run dev
```

### CRE Workflow

```bash
cd cre
bun install
bun run src/workflows/yield-optimizer/workflow.ts
```

### Deployment

```bash
cd contracts

# Deploy all contracts
forge script script/Deploy.s.sol --rpc-url $BASE_SEPOLIA_RPC_URL --broadcast

# Create VRF subscription
forge script script/CreateVRFSub.s.sol:CreateVRFSub --rpc-url $BASE_SEPOLIA_RPC_URL --broadcast

# Fund VRF with LINK
VRF_SUB_ID=<your_sub_id> forge script script/CreateVRFSub.s.sol:FundVRFSub --rpc-url $BASE_SEPOLIA_RPC_URL --broadcast

# Add factory as VRF consumer
VRF_SUB_ID=<your_sub_id> forge script script/CreateVRFSub.s.sol:AddVRFConsumer --rpc-url $BASE_SEPOLIA_RPC_URL --broadcast
```

---

## Pool Lifecycle

```
                    ┌─────────────────────────────────────────┐
                    │              POOL LIFECYCLE              │
                    └─────────────────────────────────────────┘

  CREATE ──> PENDING ──────────> ACTIVE ──────────> COMPLETED ──> FINALIZED
              │                    │                    │            │
              │  All slots fill    │  Monthly cycle:    │  All       │  Each user
              │  → auto-activate   │  Pay → Draw → Win  │  drawings  │  claims:
              │                    │                    │  done      │  - collateral
              └────────────────────┘                    │            │  - collateral yield
                                                       │            │  - contribution yield
                                                       └────────────┘

  Monthly Payment Windows:
  ┌──────────┬──────────────┬───────────────────┐
  │ Day 1-10 │ Day 11-24    │ Day 25+           │
  │ ON TIME  │ LATE         │ DRAWING/NEXT      │
  │ +yield   │ no yield     │ counts next month │
  └──────────┴──────────────┴───────────────────┘
```

---

## Yield Distribution

At finalization, each participant receives:

1. **Remaining Collateral** — Original deposit minus deductions for missed payments
2. **Collateral Yield** — Proportional to time-weighted remaining collateral (rewarding those who never missed payments)
3. **Contribution Yield** — Proportional to on-time payment days (rewarding consistent early payers)

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Smart Contracts | Solidity 0.8.24, Foundry, OpenZeppelin, Chainlink |
| Frontend | Next.js 14, TailwindCSS, shadcn/ui, wagmi v2, viem, RainbowKit |
| Backend | Fastify, better-sqlite3, viem |
| CRE Workflow | TypeScript, @chainlink/cre-sdk, Bun |
| Chain | Base Sepolia (testnet) |

---

## License

MIT

# Starosca — Demo Video Script & Voiceover
**Complete voiceover script + screen directions for a 4–5 minute hackathon demo video**

| | |
|---|---|
| Total Duration | 4:30 – 5:00 |
| Sections | 7 Sections |
| Voice Tone | Confident, Enthusiastic |
| Language | English |

---

## Section 1 — Opening & Problem
**Timestamp: 0:00 – 0:30 (30s)**

**📺 Screen:** Show pitch deck slide 1 → slide 2 (Problem)

**🎙 Voiceover:**
Hi, I'm presenting **Starosca** — a DeFi protocol that brings **traditional rotating savings circles** on-chain with collateral protection and **AI-powered yield optimization**.

ROSCA — known as **Arisan** in Indonesia, **Chit Funds** in India, and **Tontines** in Africa — is used by over **3 billion people** worldwide. But they suffer from three critical problems: **default risk**, **idle capital** earning zero yield, and **unfair selection** by organizers.

---

## Section 2 — Solution Overview
**Timestamp: 0:30 – 1:15 (45s)**

**📺 Screen:** Show slide 3 (Solution) → slide 4 (How It Works)

**🎙 Voiceover:**
**Starosca** solves all three problems. When you join, you deposit **full collateral** — participants × monthly amount — plus your first payment in USDC. Every month, participants pay. Pay on time — days 1 to 10 — and earn a **yield bonus**. On day 25, **Chainlink VRF** randomly selects a winner who receives the full pot. Miss a payment? It's **auto-deducted from collateral** — the pool stays solvent. After all rounds, get your collateral back **plus accumulated yield**.

---

## Section 3 — Chainlink Deep-Dive
**Timestamp: 1:15 – 2:15 (60s)**

**📺 Screen:** Show slide 5 (6 Products) → slide 6 (CRE Workflow diagram)

**🎙 Voiceover:**
Starosca integrates **6 Chainlink products**.

Most importantly — the **CRE Workflow**, our AI Yield Optimizer. Every 4 hours, it fetches APY data from DeFiLlama, sends it to **GPT-4o-mini** for AI analysis — considering APY, TVL, risk, and trends — and if it finds a better protocol with at least 0.5% improvement, it **auto-rebalances** on-chain. Fully autonomous, decentralized, AI-powered.

**VRF v2.5** — provably fair random drawings. **Automation** — trustless monthly triggers. **Data Feeds** — real-time price data. **Functions** — off-chain APY fetching. **CCIP** — cross-chain deposits from Ethereum or Arbitrum.

> 💡 **Tip:** Emphasize CRE — speak with conviction. This is the mandatory integration and your biggest differentiator.

---

## Section 4 — Live Demo ⭐ KEY
**Timestamp: 2:15 – 3:30 (75s)**

**📺 Screen:** Open `demo-live.html` in browser → click ▶ PLAY DEMO

**🎙 Voiceover:**
Let me show you the **live interactive demo**. I'll walk through the complete flow from wallet connection to final withdrawal.

---

**📺 Screen:** Connect Wallet modal → wallet shows 1,000 USDC balance

**🎙 Voiceover:**
First I connect my wallet. I have **1,000 USDC** ready. The pool I'm joining has **3 participants** and a **10 USDC monthly contribution** — meaning 30 USDC collateral plus 10 for the first payment. **40 USDC total** to join.

---

**📺 Screen:** Approve USDC tx → Join Pool tx → balance drops to 960 USDC → collateral shows 30 USDC → yield counter starts

**🎙 Voiceover:**
First I approve USDC, then join the pool. My **30 USDC collateral** is immediately routed to the highest-yielding DeFi protocol via the YieldManager. My balance is now 960 USDC. The **yield counter starts**.

---

**📺 Screen:** Pay Month 1 → VRF drawing animation → Bob wins (30 USDC pot)

**🎙 Voiceover:**
Month 1: I pay my 10 USDC contribution on time — earning the yield bonus. **Chainlink VRF** draws the winner... Bob wins this month and receives the **30 USDC pot**. I didn't win this month, but my collateral is still earning yield.

---

**📺 Screen:** Pay Month 2 → VRF drawing → Alice (YOU) wins! → +30 USDC received

**🎙 Voiceover:**
Month 2: I pay again on time. VRF draws... and **I win month 2!** I receive the **30 USDC pot** directly to my wallet. My balance is now 990 USDC.

---

**📺 Screen:** Pay Month 3 → VRF → Carol wins → Pool COMPLETE → Finalize appears

**🎙 Voiceover:**
Month 3: Carol wins the final drawing. All 3 rounds complete — the pool is ready to **finalize**.

---

**📺 Screen:** Finalize & Claim → breakdown: 30 USDC collateral + yield → Withdraw → final balance summary

**🎙 Voiceover:**
I click Finalize and Claim. I receive back my **30 USDC collateral**, plus **collateral yield** (proportional to how long it was deployed), plus **contribution yield** (bonus for paying on time). **Total: ~31.8 USDC** returned. Combined with my month-2 pot win, my net result is a **profit of 1.8 USDC** on top of getting all my savings back.

---

## Section 5 — Code & Architecture
**Timestamp: 3:30 – 4:15 (45s)**

**📺 Screen:** VS Code → `contracts/src/StaroscaFactory.sol` → scroll to `fulfillRandomWords()`

**🎙 Voiceover:**
Here's the VRF integration in the Factory. When a drawing is requested, the factory calls Chainlink VRF, and **fulfillRandomWords** routes the random number to the specific pool for winner selection. Pool contracts are **EIP-1167 minimal proxy clones** — 97% cheaper to deploy than full contracts.

---

**📺 Screen:** `cre/src/workflows/yield-optimizer/workflow.ts` → show fetchAPYData → analyzeYieldWithAI → executeRebalance

**🎙 Voiceover:**
The **CRE Workflow** — three stages: fetch APY data from DeFiLlama, AI analysis via GPT-4o-mini, and on-chain rebalance execution. This runs on **Chainlink's decentralized oracle network** every 4 hours. No centralized server needed.

---

## Section 6 — Deployment Proof
**Timestamp: 4:15 – 4:40 (25s)**

**📺 Screen:** BaseScan with StaroscaFactory address → VRF subscription page at vrf.chain.link showing 25 LINK balance

**🎙 Voiceover:**
Everything is **live on Base Sepolia**. Factory, YieldManager, CrossChainDeposit, and three yield adapters — all deployed. Our VRF subscription is **funded with 25 LINK**. This is a **working, deployed protocol**, not a mockup.

---

## Section 7 — Closing
**Timestamp: 4:40 – 5:00 (20s)**

**📺 Screen:** Pitch deck slide 11 (Thank You) — shows GitHub + starosca.vercel.app

**🎙 Voiceover:**
**Starosca** — full-stack DeFi, 6 Chainlink integrations, real-world impact for billions of ROSCA users, deployed and functional. Thank you. Try it at **starosca.vercel.app**.

---

## Full Voiceover — Copy & Paste (ElevenLabs / Murf.ai)

```
Hi, I'm presenting Starosca — a DeFi protocol that brings traditional rotating savings circles on-chain with collateral protection and AI-powered yield optimization.

ROSCA — known as Arisan in Indonesia, Chit Funds in India, and Tontines in Africa — is used by over 3 billion people worldwide. But they suffer from three critical problems: default risk after receiving the pot, idle capital earning zero yield, and unfair selection by organizers.

Starosca solves all three. When you join, you deposit full collateral — participants times monthly amount — plus your first payment in USDC. Every month, participants pay their contribution. Pay on time — days 1 to 10 — and earn a yield bonus. On day 25, Chainlink VRF randomly selects a winner who receives the full pot. Miss a payment, and it's auto-deducted from collateral — the pool stays solvent. After all rounds, get your collateral back plus accumulated yield.

Starosca integrates 6 Chainlink products. Most importantly — the CRE Workflow, our AI Yield Optimizer. Every 4 hours, it fetches APY data, sends it to GPT-4o-mini for AI analysis, and if it finds a better protocol with at least 0.5% improvement, it auto-rebalances on-chain. Fully autonomous, decentralized, AI-powered.

VRF v2.5 provides provably fair random drawings. Automation handles trustless monthly triggers. Data Feeds provide real-time price data. Functions powers off-chain APY fetching. And CCIP allows cross-chain deposits from Ethereum or Arbitrum.

Let me show you the live demo. I have 1,000 USDC. The pool has 3 participants and a 10 USDC monthly contribution — 30 USDC collateral plus 10 for the first payment. 40 USDC total to join.

I approve USDC, then join the pool. My 30 USDC collateral is immediately routed to the highest-yielding DeFi protocol. My balance is now 960 USDC. The yield counter starts.

Month 1: I pay my contribution on time, earning the yield bonus. Chainlink VRF draws the winner... Bob wins this month and receives the 30 USDC pot. I didn't win, but my collateral is still earning yield.

Month 2: I pay again on time. VRF draws... and I win month 2! I receive the 30 USDC pot directly to my wallet. My balance is now 990 USDC.

Month 3: Carol wins the final drawing. All rounds complete.

I finalize and claim. I receive back my 30 USDC collateral, plus collateral yield, plus contribution yield for paying on time. Total: 31.8 USDC returned. Combined with my pot win, I profited 1.8 USDC on top of getting all my savings back.

Here's the VRF integration in the Factory contract — fulfillRandomWords routes the random number to the pool for winner selection. Pools are EIP-1167 minimal proxy clones — 97% cheaper than full contract deployment.

The CRE Workflow — three stages: fetch APY data from DeFiLlama, AI analysis via GPT-4o-mini, and on-chain rebalance execution. Running on Chainlink's decentralized oracle network every 4 hours. No centralized server needed.

Everything is live on Base Sepolia. Factory, YieldManager, CrossChainDeposit, and three yield adapters — all deployed. VRF subscription funded with 25 LINK.

Starosca — full-stack DeFi, 6 Chainlink integrations, real-world impact for billions of ROSCA users, deployed and functional. Thank you. Try it at starosca.vercel.app.
```

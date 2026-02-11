/**
 * Starosca AI Yield Optimizer — CRE Workflow
 *
 * This workflow runs every 4 hours on the Chainlink DON to:
 * 1. Fetch APY data from DeFiLlama API + on-chain protocol reads
 * 2. Analyze yield opportunities using an AI/LLM model
 * 3. Execute rebalancing on-chain if a better protocol is found
 *
 * Integrates: Chainlink CRE, HTTP Client, EVM Client, AI/LLM
 * Chain: Base Sepolia (testnet)
 */

import {
  cre,
  type Runtime,
  type NodeRuntime,
  type CronPayload,
  Runner,
  consensusMedianAggregation,
  consensusIdenticalAggregation,
} from "@chainlink/cre-sdk";
import { z } from "zod";
import {
  PROTOCOLS,
  DEFILLAMA_YIELDS_URL,
  YIELD_MANAGER_ABI,
  ADAPTER_ABI,
  BASE_SEPOLIA_CHAIN_ID,
} from "../../config/protocols";

// ============================================================
// Config Schema — validated by CRE runner
// ============================================================

const configSchema = z.object({
  schedule: z.string().default("0 0 */4 * * *"), // Every 4 hours
  yieldManagerAddress: z.string(),
  adapters: z.object({
    aaveV3: z.string(),
    compoundV3: z.string(),
    moonwell: z.string(),
  }),
  rebalanceThresholdBps: z.number().default(50), // 0.5% minimum APY improvement
  openaiApiUrl: z.string().default("https://api.openai.com/v1/chat/completions"),
  openaiModel: z.string().default("gpt-4o-mini"),
  chainId: z.number().default(BASE_SEPOLIA_CHAIN_ID),
});

type Config = z.infer<typeof configSchema>;

// ============================================================
// Types
// ============================================================

interface APYData {
  protocol: string;
  adapterAddress: string;
  apyOnChain: number; // basis points from contract
  apyOffChain: number; // from DeFiLlama
  tvl: number;
  balance: number; // current deposit balance
}

interface AIRecommendation {
  recommendedProtocol: string;
  recommendedAdapter: string;
  confidence: number; // 0-100
  reasoning: string;
  shouldRebalance: boolean;
}

interface YieldSnapshot {
  timestamp: number;
  protocols: APYData[];
  recommendation: AIRecommendation;
  rebalanced: boolean;
}

// ============================================================
// Callback: Fetch APY Data (HTTP + EVM Read)
// ============================================================

/**
 * Step 1: Fetch yield data from multiple sources:
 * - DeFiLlama API (off-chain, real-time APY aggregation)
 * - On-chain adapter contracts (current APY + balance)
 *
 * Uses NodeRuntime for HTTP calls (each node fetches independently)
 * then consensus aggregates the results.
 */
function fetchAPYData(
  runtime: Runtime<Config>,
  _payload: CronPayload
): APYData[] {
  const config = runtime.config;
  const logger = runtime.logger;

  logger.info("Starting APY data fetch from DeFiLlama + on-chain adapters");

  // --- Off-chain: Fetch from DeFiLlama API ---
  const defiLlamaData = runtime.runInNodeMode(
    (nodeRuntime: NodeRuntime<Config>) => {
      const httpClient = new cre.capabilities.HTTPClient(nodeRuntime);
      const response = httpClient
        .sendRequest({
          url: DEFILLAMA_YIELDS_URL,
          method: "GET",
          headers: { "Content-Type": "application/json" },
        })
        .result();

      // Parse DeFiLlama response and filter Base stablecoin pools
      const pools = JSON.parse(response.body);
      const basePools = (pools.data || []).filter(
        (p: { chain: string; stablecoin: boolean }) =>
          p.chain === "Base" && p.stablecoin === true
      );

      // Extract relevant protocol APYs
      const aavePool = basePools.find(
        (p: { project: string; symbol: string }) =>
          p.project === "aave-v3" && p.symbol === "USDC"
      );
      const compoundPool = basePools.find(
        (p: { project: string; symbol: string }) =>
          p.project === "compound-v3" && p.symbol === "USDC"
      );
      const moonwellPool = basePools.find(
        (p: { project: string; symbol: string }) =>
          p.project === "moonwell" && p.symbol === "USDC"
      );

      return {
        aaveAPY: aavePool?.apy ?? 0,
        compoundAPY: compoundPool?.apy ?? 0,
        moonwellAPY: moonwellPool?.apy ?? 0,
        aaveTVL: aavePool?.tvlUsd ?? 0,
        compoundTVL: compoundPool?.tvlUsd ?? 0,
        moonwellTVL: moonwellPool?.tvlUsd ?? 0,
      };
    },
    consensusMedianAggregation
  ).result();

  // --- On-chain: Read APY + Balance from each adapter ---
  const evmClient = new cre.capabilities.EVMClient(runtime);

  // Read Aave adapter APY
  const aaveAPYOnChain = evmClient
    .read({
      chainId: config.chainId,
      contractAddress: config.adapters.aaveV3,
      abi: [ADAPTER_ABI.getAPY],
      functionName: "getAPY",
      args: [],
    })
    .result();

  const aaveBalance = evmClient
    .read({
      chainId: config.chainId,
      contractAddress: config.adapters.aaveV3,
      abi: [ADAPTER_ABI.getBalance],
      functionName: "getBalance",
      args: [],
    })
    .result();

  // Read Compound adapter APY
  const compoundAPYOnChain = evmClient
    .read({
      chainId: config.chainId,
      contractAddress: config.adapters.compoundV3,
      abi: [ADAPTER_ABI.getAPY],
      functionName: "getAPY",
      args: [],
    })
    .result();

  const compoundBalance = evmClient
    .read({
      chainId: config.chainId,
      contractAddress: config.adapters.compoundV3,
      abi: [ADAPTER_ABI.getBalance],
      functionName: "getBalance",
      args: [],
    })
    .result();

  // Read Moonwell adapter APY
  const moonwellAPYOnChain = evmClient
    .read({
      chainId: config.chainId,
      contractAddress: config.adapters.moonwell,
      abi: [ADAPTER_ABI.getAPY],
      functionName: "getAPY",
      args: [],
    })
    .result();

  const moonwellBalance = evmClient
    .read({
      chainId: config.chainId,
      contractAddress: config.adapters.moonwell,
      abi: [ADAPTER_ABI.getBalance],
      functionName: "getBalance",
      args: [],
    })
    .result();

  const protocols: APYData[] = [
    {
      protocol: "Aave V3",
      adapterAddress: config.adapters.aaveV3,
      apyOnChain: Number(aaveAPYOnChain),
      apyOffChain: defiLlamaData.aaveAPY * 100, // Convert % to bps
      tvl: defiLlamaData.aaveTVL,
      balance: Number(aaveBalance),
    },
    {
      protocol: "Compound V3",
      adapterAddress: config.adapters.compoundV3,
      apyOnChain: Number(compoundAPYOnChain),
      apyOffChain: defiLlamaData.compoundAPY * 100,
      tvl: defiLlamaData.compoundTVL,
      balance: Number(compoundBalance),
    },
    {
      protocol: "Moonwell",
      adapterAddress: config.adapters.moonwell,
      apyOnChain: Number(moonwellAPYOnChain),
      apyOffChain: defiLlamaData.moonwellAPY * 100,
      tvl: defiLlamaData.moonwellTVL,
      balance: Number(moonwellBalance),
    },
  ];

  logger.info(
    `Fetched APY data: ${protocols.map((p) => `${p.protocol}: ${p.apyOnChain}bps on-chain, ${p.apyOffChain.toFixed(0)}bps off-chain`).join(" | ")}`
  );

  return protocols;
}

// ============================================================
// Callback: AI Yield Analysis (HTTP to LLM API)
// ============================================================

/**
 * Step 2: Send APY data to an AI/LLM model for analysis.
 * The AI considers APY, TVL, risk, and historical trends
 * to recommend the optimal yield protocol.
 *
 * Uses NodeRuntime because the OpenAI API call is per-node,
 * then uses identical aggregation to ensure nodes agree on the recommendation.
 */
function analyzeYieldWithAI(
  runtime: Runtime<Config>,
  protocols: APYData[]
): AIRecommendation {
  const config = runtime.config;
  const logger = runtime.logger;

  logger.info("Sending APY data to AI model for yield analysis");

  const protocolSummary = protocols
    .map(
      (p) =>
        `${p.protocol}: APY=${(p.apyOnChain / 100).toFixed(2)}% (on-chain), ` +
        `${(p.apyOffChain / 100).toFixed(2)}% (DeFiLlama), TVL=$${(p.tvl / 1e6).toFixed(1)}M, ` +
        `Balance=${(p.balance / 1e6).toFixed(2)} USDC`
    )
    .join("\n");

  const prompt = `You are an AI yield optimizer for a DeFi ROSCA protocol called Starosca on Base L2.
Your job is to analyze yield data from 3 DeFi protocols and recommend the best one for USDC deposits.

Current yield data:
${protocolSummary}

Consider these factors:
1. Current APY (higher is better)
2. TVL (higher TVL = more liquid and safer)
3. Protocol maturity and audit history (Aave > Compound > Moonwell)
4. Consistency between on-chain and off-chain APY data

Respond in this exact JSON format:
{
  "recommendedProtocol": "<protocol name>",
  "confidence": <0-100>,
  "reasoning": "<brief 1-2 sentence explanation>"
}`;

  const aiResponse = runtime.runInNodeMode(
    (nodeRuntime: NodeRuntime<Config>) => {
      const httpClient = new cre.capabilities.HTTPClient(nodeRuntime);
      const response = httpClient
        .sendRequest({
          url: config.openaiApiUrl,
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${nodeRuntime.getSecret("OPENAI_API_KEY")}`,
          },
          body: JSON.stringify({
            model: config.openaiModel,
            messages: [{ role: "user", content: prompt }],
            temperature: 0, // Deterministic for consensus
            max_tokens: 200,
          }),
        })
        .result();

      const parsed = JSON.parse(response.body);
      const content = parsed.choices?.[0]?.message?.content ?? "{}";

      // Extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        return {
          recommendedProtocol: "Aave V3",
          confidence: 50,
          reasoning: "Fallback: could not parse AI response",
        };
      }

      return JSON.parse(jsonMatch[0]) as {
        recommendedProtocol: string;
        confidence: number;
        reasoning: string;
      };
    },
    consensusIdenticalAggregation
  ).result();

  // Map AI recommendation to adapter address
  const recommended = protocols.find(
    (p) =>
      p.protocol.toLowerCase() === aiResponse.recommendedProtocol.toLowerCase()
  );

  const recommendation: AIRecommendation = {
    recommendedProtocol: aiResponse.recommendedProtocol,
    recommendedAdapter: recommended?.adapterAddress ?? protocols[0].adapterAddress,
    confidence: aiResponse.confidence,
    reasoning: aiResponse.reasoning,
    shouldRebalance: aiResponse.confidence >= 70,
  };

  logger.info(
    `AI recommends: ${recommendation.recommendedProtocol} (confidence: ${recommendation.confidence}%) — ${recommendation.reasoning}`
  );

  return recommendation;
}

// ============================================================
// Callback: Execute Rebalance (EVM Write)
// ============================================================

/**
 * Step 3: If the AI recommends a different protocol with high confidence,
 * execute on-chain rebalancing via YieldManager.rebalance().
 *
 * The DON signs and sends the transaction via the EVM client.
 */
function executeRebalance(
  runtime: Runtime<Config>,
  recommendation: AIRecommendation,
  protocols: APYData[]
): boolean {
  const config = runtime.config;
  const logger = runtime.logger;
  const evmClient = new cre.capabilities.EVMClient(runtime);

  // Find current active protocol (the one with balance > 0)
  const currentActive = protocols.find((p) => p.balance > 0);

  if (!currentActive) {
    logger.info("No active deposits found — skipping rebalance");
    return false;
  }

  // Check if rebalance is needed
  if (currentActive.adapterAddress === recommendation.recommendedAdapter) {
    logger.info(
      `Already using optimal protocol: ${currentActive.protocol} — no rebalance needed`
    );
    return false;
  }

  // Check APY improvement threshold
  const currentAPY = currentActive.apyOnChain;
  const recommended = protocols.find(
    (p) => p.adapterAddress === recommendation.recommendedAdapter
  );
  const newAPY = recommended?.apyOnChain ?? 0;
  const improvementBps = newAPY - currentAPY;

  if (improvementBps < config.rebalanceThresholdBps) {
    logger.info(
      `APY improvement (${improvementBps}bps) below threshold (${config.rebalanceThresholdBps}bps) — skipping`
    );
    return false;
  }

  if (!recommendation.shouldRebalance) {
    logger.info(
      `AI confidence too low (${recommendation.confidence}%) — skipping rebalance`
    );
    return false;
  }

  // Execute rebalance on-chain
  logger.info(
    `Rebalancing: ${currentActive.protocol} → ${recommendation.recommendedProtocol} (+${improvementBps}bps APY)`
  );

  evmClient
    .write({
      chainId: config.chainId,
      contractAddress: config.yieldManagerAddress,
      abi: [YIELD_MANAGER_ABI.rebalance],
      functionName: "rebalance",
      args: [currentActive.adapterAddress, recommendation.recommendedAdapter],
    })
    .result();

  logger.info("Rebalance transaction submitted successfully");
  return true;
}

// ============================================================
// Main Workflow Handler — Cron Triggered
// ============================================================

/**
 * Main workflow callback: orchestrates the full yield optimization pipeline.
 * Triggered every 4 hours by the CRE Cron capability.
 *
 * Pipeline:
 * 1. fetchAPYData — HTTP (DeFiLlama) + EVM Read (adapter contracts)
 * 2. analyzeYieldWithAI — HTTP (OpenAI API) with consensus
 * 3. executeRebalance — EVM Write (YieldManager.rebalance) if needed
 * 4. Log snapshot for monitoring
 */
function onCronTrigger(
  runtime: Runtime<Config>,
  payload: CronPayload
): YieldSnapshot {
  const logger = runtime.logger;
  logger.info("=== Starosca AI Yield Optimizer: Starting optimization cycle ===");

  // Step 1: Fetch APY data from multiple sources
  const protocols = fetchAPYData(runtime, payload);

  // Step 2: Analyze with AI
  const recommendation = analyzeYieldWithAI(runtime, protocols);

  // Step 3: Execute rebalance if beneficial
  const rebalanced = executeRebalance(runtime, recommendation, protocols);

  // Step 4: Create snapshot for monitoring
  const snapshot: YieldSnapshot = {
    timestamp: runtime.now(),
    protocols,
    recommendation,
    rebalanced,
  };

  logger.info(
    `=== Optimization cycle complete. Rebalanced: ${rebalanced} ===`
  );

  return snapshot;
}

// ============================================================
// Workflow Registration
// ============================================================

function initWorkflow(config: Config) {
  const cron = new cre.capabilities.CronCapability();

  return [
    cre.handler(
      cron.trigger({ schedule: config.schedule }),
      onCronTrigger
    ),
  ];
}

// ============================================================
// Entry Point
// ============================================================

async function main() {
  const runner = Runner.newRunner<Config>({
    configSchema,
  });

  await runner.run(initWorkflow);
}

main();

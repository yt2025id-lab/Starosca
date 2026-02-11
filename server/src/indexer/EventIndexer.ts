import { createPublicClient, http, parseAbiItem, type Log } from "viem";
import { baseSepolia } from "viem/chains";
import type Database from "better-sqlite3";

const FACTORY_EVENTS = [
  parseAbiItem(
    "event PoolCreated(address indexed pool, address indexed creator, uint8 maxParticipants, uint256 monthlyContribution)"
  ),
];

const POOL_EVENTS = [
  parseAbiItem(
    "event ParticipantJoined(address indexed participant, uint256 collateral, uint256 firstContribution)"
  ),
  parseAbiItem(
    "event PaymentMade(address indexed participant, uint8 month, uint256 amount, uint8 status)"
  ),
  parseAbiItem(
    "event DrawingCompleted(uint8 month, address indexed winner, uint256 potAmount)"
  ),
  parseAbiItem("event PoolActivated(uint256 timestamp)"),
  parseAbiItem("event PoolFinalized(uint256 totalYield)"),
];

export class EventIndexer {
  private client;
  private db: Database.Database;
  private factoryAddress: `0x${string}`;
  private pollingInterval: number;
  private running = false;

  constructor(
    db: Database.Database,
    factoryAddress: string,
    rpcUrl: string,
    pollingInterval = 10_000
  ) {
    this.db = db;
    this.factoryAddress = factoryAddress as `0x${string}`;
    this.pollingInterval = pollingInterval;
    this.client = createPublicClient({
      chain: baseSepolia,
      transport: http(rpcUrl),
    });
  }

  async start() {
    this.running = true;
    console.log("[Indexer] Starting event indexer...");

    while (this.running) {
      try {
        await this.poll();
      } catch (err) {
        console.error("[Indexer] Error during poll:", err);
      }
      await new Promise((r) => setTimeout(r, this.pollingInterval));
    }
  }

  stop() {
    this.running = false;
    console.log("[Indexer] Stopping...");
  }

  private async poll() {
    const lastBlock = this.getLastBlock();
    const currentBlock = await this.client.getBlockNumber();
    if (currentBlock <= BigInt(lastBlock)) return;

    const fromBlock = BigInt(lastBlock) + 1n;
    const toBlock = currentBlock;

    // Index factory events
    const factoryLogs = await this.client.getLogs({
      address: this.factoryAddress,
      events: FACTORY_EVENTS,
      fromBlock,
      toBlock,
    });

    for (const log of factoryLogs) {
      this.handlePoolCreated(log);
    }

    // Index pool events for all known pools
    const pools = this.db
      .prepare("SELECT address FROM pools")
      .all() as { address: string }[];

    for (const pool of pools) {
      const poolLogs = await this.client.getLogs({
        address: pool.address as `0x${string}`,
        events: POOL_EVENTS,
        fromBlock,
        toBlock,
      });

      for (const log of poolLogs) {
        this.handlePoolEvent(pool.address, log);
      }
    }

    this.setLastBlock(Number(toBlock));

    if (factoryLogs.length > 0 || pools.length > 0) {
      console.log(
        `[Indexer] Indexed blocks ${fromBlock}-${toBlock}: ${factoryLogs.length} factory events`
      );
    }
  }

  private handlePoolCreated(log: Log) {
    const args = (log as any).args;
    if (!args) return;

    this.db
      .prepare(
        `INSERT OR IGNORE INTO pools (address, creator, max_participants, monthly_contribution, status, current_month, created_at, block_number)
         VALUES (?, ?, ?, ?, 0, 0, ?, ?)`
      )
      .run(
        args.pool,
        args.creator,
        Number(args.maxParticipants),
        args.monthlyContribution.toString(),
        Math.floor(Date.now() / 1000),
        Number(log.blockNumber)
      );

    console.log(`[Indexer] Pool created: ${args.pool} by ${args.creator}`);
  }

  private handlePoolEvent(poolAddress: string, log: Log) {
    const eventName = (log as any).eventName;
    const args = (log as any).args;
    if (!args) return;

    switch (eventName) {
      case "ParticipantJoined":
        this.db
          .prepare(
            `INSERT OR IGNORE INTO participants (pool_address, participant, joined_at, block_number)
             VALUES (?, ?, ?, ?)`
          )
          .run(
            poolAddress,
            args.participant,
            Math.floor(Date.now() / 1000),
            Number(log.blockNumber)
          );
        console.log(
          `[Indexer] Participant joined pool ${poolAddress.slice(0, 10)}...: ${args.participant}`
        );
        break;

      case "PaymentMade":
        this.db
          .prepare(
            `INSERT INTO payments (pool_address, participant, month, amount, status, paid_at, block_number, tx_hash)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
          )
          .run(
            poolAddress,
            args.participant,
            Number(args.month),
            args.amount.toString(),
            Number(args.status),
            Math.floor(Date.now() / 1000),
            Number(log.blockNumber),
            log.transactionHash
          );
        break;

      case "DrawingCompleted":
        this.db
          .prepare(
            `INSERT INTO drawings (pool_address, month, winner, pot_amount, drawn_at, block_number, tx_hash)
             VALUES (?, ?, ?, ?, ?, ?, ?)`
          )
          .run(
            poolAddress,
            Number(args.month),
            args.winner,
            args.potAmount.toString(),
            Math.floor(Date.now() / 1000),
            Number(log.blockNumber),
            log.transactionHash
          );
        console.log(
          `[Indexer] Drawing month ${args.month}: winner ${args.winner}`
        );
        break;

      case "PoolActivated":
        this.db
          .prepare("UPDATE pools SET status = 1 WHERE address = ?")
          .run(poolAddress);
        break;

      case "PoolFinalized":
        this.db
          .prepare("UPDATE pools SET status = 3 WHERE address = ?")
          .run(poolAddress);
        break;
    }
  }

  private getLastBlock(): number {
    const row = this.db
      .prepare("SELECT value FROM indexer_state WHERE key = 'last_block'")
      .get() as { value: string } | undefined;
    return row ? parseInt(row.value) : 0;
  }

  private setLastBlock(block: number) {
    this.db
      .prepare(
        "INSERT OR REPLACE INTO indexer_state (key, value) VALUES ('last_block', ?)"
      )
      .run(block.toString());
  }
}

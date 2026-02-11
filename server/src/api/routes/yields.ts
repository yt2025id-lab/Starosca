import type { FastifyInstance } from "fastify";
import type Database from "better-sqlite3";

export async function yieldRoutes(app: FastifyInstance) {
  const db: Database.Database = (app as any).db;

  // GET /api/yields/snapshots — recent yield snapshots
  app.get("/yields/snapshots", async (req) => {
    const { limit } = req.query as { limit?: string };
    const n = Math.min(Number(limit) || 50, 200);

    const snapshots = db
      .prepare(
        "SELECT * FROM yield_snapshots ORDER BY timestamp DESC LIMIT ?"
      )
      .all(n);

    return { snapshots };
  });

  // GET /api/yields/latest — latest yield snapshot
  app.get("/yields/latest", async () => {
    const snapshot = db
      .prepare("SELECT * FROM yield_snapshots ORDER BY timestamp DESC LIMIT 1")
      .get();

    return { snapshot: snapshot ?? null };
  });

  // GET /api/indexer/status — indexer status
  app.get("/indexer/status", async () => {
    const row = db
      .prepare("SELECT value FROM indexer_state WHERE key = 'last_block'")
      .get() as { value: string } | undefined;

    const poolCount = db
      .prepare("SELECT COUNT(*) as count FROM pools")
      .get() as { count: number };

    return {
      lastBlock: row ? parseInt(row.value) : 0,
      poolCount: poolCount.count,
    };
  });
}

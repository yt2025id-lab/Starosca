import type { FastifyInstance } from "fastify";
import type Database from "better-sqlite3";

export async function poolRoutes(app: FastifyInstance) {
  const db: Database.Database = (app as any).db;

  // GET /api/pools — list all pools
  app.get("/pools", async (req) => {
    const { status, creator } = req.query as {
      status?: string;
      creator?: string;
    };

    let sql = "SELECT * FROM pools";
    const conditions: string[] = [];
    const params: unknown[] = [];

    if (status !== undefined) {
      conditions.push("status = ?");
      params.push(Number(status));
    }
    if (creator) {
      conditions.push("LOWER(creator) = LOWER(?)");
      params.push(creator);
    }

    if (conditions.length) {
      sql += " WHERE " + conditions.join(" AND ");
    }
    sql += " ORDER BY created_at DESC";

    const pools = db.prepare(sql).all(...params);
    return { pools };
  });

  // GET /api/pools/:address — pool detail
  app.get("/pools/:address", async (req) => {
    const { address } = req.params as { address: string };

    const pool = db
      .prepare("SELECT * FROM pools WHERE LOWER(address) = LOWER(?)")
      .get(address);
    if (!pool) return { error: "Pool not found" };

    const participants = db
      .prepare("SELECT * FROM participants WHERE LOWER(pool_address) = LOWER(?)")
      .all(address);

    const payments = db
      .prepare(
        "SELECT * FROM payments WHERE LOWER(pool_address) = LOWER(?) ORDER BY month, paid_at"
      )
      .all(address);

    const drawings = db
      .prepare(
        "SELECT * FROM drawings WHERE LOWER(pool_address) = LOWER(?) ORDER BY month"
      )
      .all(address);

    return { pool, participants, payments, drawings };
  });

  // GET /api/pools/:address/participants
  app.get("/pools/:address/participants", async (req) => {
    const { address } = req.params as { address: string };
    const participants = db
      .prepare("SELECT * FROM participants WHERE LOWER(pool_address) = LOWER(?)")
      .all(address);
    return { participants };
  });

  // GET /api/pools/:address/payments
  app.get("/pools/:address/payments", async (req) => {
    const { address } = req.params as { address: string };
    const { month } = req.query as { month?: string };

    let sql =
      "SELECT * FROM payments WHERE LOWER(pool_address) = LOWER(?)";
    const params: unknown[] = [address];

    if (month !== undefined) {
      sql += " AND month = ?";
      params.push(Number(month));
    }
    sql += " ORDER BY month, paid_at";

    const payments = db.prepare(sql).all(...params);
    return { payments };
  });

  // GET /api/pools/:address/drawings
  app.get("/pools/:address/drawings", async (req) => {
    const { address } = req.params as { address: string };
    const drawings = db
      .prepare(
        "SELECT * FROM drawings WHERE LOWER(pool_address) = LOWER(?) ORDER BY month"
      )
      .all(address);
    return { drawings };
  });

  // GET /api/user/:address/pools — pools a user is participating in
  app.get("/user/:address/pools", async (req) => {
    const { address } = req.params as { address: string };

    const pools = db
      .prepare(
        `SELECT p.* FROM pools p
         INNER JOIN participants pt ON LOWER(p.address) = LOWER(pt.pool_address)
         WHERE LOWER(pt.participant) = LOWER(?)
         ORDER BY p.created_at DESC`
      )
      .all(address);

    return { pools };
  });
}

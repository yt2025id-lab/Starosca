import "dotenv/config";
import Fastify from "fastify";
import cors from "@fastify/cors";
import { initDB } from "./db/schema.js";
import { EventIndexer } from "./indexer/EventIndexer.js";
import { poolRoutes } from "./api/routes/pools.js";
import { yieldRoutes } from "./api/routes/yields.js";
import { healthRoutes } from "./api/routes/health.js";

const PORT = Number(process.env.PORT) || 3001;
const RPC_URL = process.env.BASE_SEPOLIA_RPC_URL || "https://sepolia.base.org";
const FACTORY_ADDRESS =
  process.env.FACTORY_ADDRESS ||
  "0x6D59cE9DfC9dB97C8b4EBCF53807b606BB4Ed370";

const db = initDB();

const app = Fastify({ logger: true });

await app.register(cors, { origin: true });

// Register routes
app.register(healthRoutes);
app.register(poolRoutes, { prefix: "/api" });
app.register(yieldRoutes, { prefix: "/api" });

// Attach db to request via decorator
app.decorate("db", db);

// Start event indexer
const indexer = new EventIndexer(db, FACTORY_ADDRESS, RPC_URL);
indexer.start();

// Graceful shutdown
const shutdown = () => {
  console.log("Shutting down...");
  indexer.stop();
  db.close();
  process.exit(0);
};
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

try {
  await app.listen({ port: PORT, host: "0.0.0.0" });
  console.log(`Server running on http://localhost:${PORT}`);
} catch (err) {
  app.log.error(err);
  process.exit(1);
}

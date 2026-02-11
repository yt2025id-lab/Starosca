import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, "../../data/starosca.db");

export function initDB(): Database.Database {
  const db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");

  db.exec(`
    CREATE TABLE IF NOT EXISTS pools (
      address TEXT PRIMARY KEY,
      creator TEXT NOT NULL,
      max_participants INTEGER NOT NULL,
      monthly_contribution TEXT NOT NULL,
      status INTEGER DEFAULT 0,
      current_month INTEGER DEFAULT 0,
      created_at INTEGER NOT NULL,
      block_number INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS participants (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      pool_address TEXT NOT NULL,
      participant TEXT NOT NULL,
      joined_at INTEGER NOT NULL,
      block_number INTEGER NOT NULL,
      UNIQUE(pool_address, participant)
    );

    CREATE TABLE IF NOT EXISTS payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      pool_address TEXT NOT NULL,
      participant TEXT NOT NULL,
      month INTEGER NOT NULL,
      amount TEXT NOT NULL,
      status INTEGER NOT NULL,
      paid_at INTEGER NOT NULL,
      block_number INTEGER NOT NULL,
      tx_hash TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS drawings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      pool_address TEXT NOT NULL,
      month INTEGER NOT NULL,
      winner TEXT NOT NULL,
      pot_amount TEXT NOT NULL,
      drawn_at INTEGER NOT NULL,
      block_number INTEGER NOT NULL,
      tx_hash TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS yield_snapshots (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      timestamp INTEGER NOT NULL,
      aave_apy INTEGER NOT NULL,
      compound_apy INTEGER NOT NULL,
      moonwell_apy INTEGER NOT NULL,
      active_protocol TEXT NOT NULL,
      total_deposits TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS indexer_state (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    INSERT OR IGNORE INTO indexer_state (key, value) VALUES ('last_block', '0');
  `);

  return db;
}

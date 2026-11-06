import fs from "fs";
import path from "path";
import { getPostgresPool } from "../db/postgres";

const FALLBACK_FILE =
  process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME
    ? path.join("/tmp", "visitors.json")
    : path.join(process.cwd(), "src", "server", "db", "data", "visitors.json");

let tableReady = false;

async function ensureTable(): Promise<boolean> {
  const pool = getPostgresPool();
  if (!pool) return false;
  if (tableReady) return true;
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS site_visitors (
        visitor_id VARCHAR(64) PRIMARY KEY,
        first_seen TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    tableReady = true;
    return true;
  } catch (error) {
    console.error("site_visitors init error:", error);
    return false;
  }
}

function readFallback(): string[] {
  try {
    if (fs.existsSync(FALLBACK_FILE)) {
      const parsed = JSON.parse(fs.readFileSync(FALLBACK_FILE, "utf-8"));
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (err) {
    console.warn("Failed to read visitors.json:", err);
  }
  return [];
}

function writeFallback(ids: string[]) {
  try {
    fs.mkdirSync(path.dirname(FALLBACK_FILE), { recursive: true });
    fs.writeFileSync(FALLBACK_FILE, JSON.stringify(ids), "utf-8");
  } catch (err) {
    console.error("Failed to write visitors.json:", err);
  }
}

export const VisitorRepository = {
  /** Total number of unique devices that have visited. */
  async count(): Promise<number> {
    if (await ensureTable()) {
      const { rows } = await getPostgresPool()!.query(
        "SELECT COUNT(*)::int AS total FROM site_visitors",
      );
      return rows[0]?.total ?? 0;
    }
    return readFallback().length;
  },

  /** Records a device once; repeat calls with the same id are no-ops. */
  async register(visitorId: string): Promise<number> {
    if (await ensureTable()) {
      const pool = getPostgresPool()!;
      await pool.query(
        "INSERT INTO site_visitors (visitor_id) VALUES ($1) ON CONFLICT (visitor_id) DO NOTHING",
        [visitorId],
      );
      return this.count();
    }
    const ids = readFallback();
    if (!ids.includes(visitorId)) {
      ids.push(visitorId);
      writeFallback(ids);
    }
    return ids.length;
  },
};

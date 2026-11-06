import fs from "fs";
import path from "path";
import { getPostgresPool } from "../db/postgres";

const FALLBACK_FILE =
  process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME
    ? path.join("/tmp", "visitors.json")
    : path.join(process.cwd(), "src", "server", "db", "data", "visitors.json");

type VisitorRow = { id: string; fp: string };

let tableReady = false;
let warnedNoDb = false;

async function ensureTable(): Promise<boolean> {
  const pool = getPostgresPool();
  if (!pool) {
    if (!warnedNoDb) {
      warnedNoDb = true;
      console.warn(
        "[visitors] No POSTGRES_URL/DATABASE_URL set — visitor count is stored per server instance and will not persist.",
      );
    }
    return false;
  }
  if (tableReady) return true;
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS site_visitors (
        visitor_id VARCHAR(64) PRIMARY KEY,
        first_seen TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      ALTER TABLE site_visitors ADD COLUMN IF NOT EXISTS fingerprint VARCHAR(64);
      CREATE UNIQUE INDEX IF NOT EXISTS idx_site_visitors_fp ON site_visitors(fingerprint);
    `);
    tableReady = true;
    return true;
  } catch (error) {
    console.error("site_visitors init error:", error);
    return false;
  }
}

function readFallback(): VisitorRow[] {
  try {
    if (fs.existsSync(FALLBACK_FILE)) {
      const parsed = JSON.parse(fs.readFileSync(FALLBACK_FILE, "utf-8"));
      if (Array.isArray(parsed)) {
        return parsed.map((r) => (typeof r === "string" ? { id: r, fp: "" } : r));
      }
    }
  } catch (err) {
    console.warn("Failed to read visitors.json:", err);
  }
  return [];
}

function writeFallback(rows: VisitorRow[]) {
  try {
    fs.mkdirSync(path.dirname(FALLBACK_FILE), { recursive: true });
    fs.writeFileSync(FALLBACK_FILE, JSON.stringify(rows), "utf-8");
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

  /**
   * Records a device once. A device already known by its id OR by its
   * fingerprint (hashed IP + browser) is not counted again; its existing id is
   * returned so the client can restore a lost cookie.
   */
  async register(visitorId: string, fingerprint: string): Promise<{ id: string; count: number }> {
    if (await ensureTable()) {
      const pool = getPostgresPool()!;
      const existing = await pool.query(
        "SELECT visitor_id FROM site_visitors WHERE visitor_id = $1 OR fingerprint = $2 LIMIT 1",
        [visitorId, fingerprint],
      );
      let id = existing.rows[0]?.visitor_id as string | undefined;
      if (!id) {
        // ON CONFLICT with no target also absorbs a race on the fingerprint index
        await pool.query(
          "INSERT INTO site_visitors (visitor_id, fingerprint) VALUES ($1, $2) ON CONFLICT DO NOTHING",
          [visitorId, fingerprint],
        );
        id = visitorId;
      }
      return { id, count: await this.count() };
    }

    const rows = readFallback();
    const found = rows.find((r) => r.id === visitorId || (fingerprint && r.fp === fingerprint));
    if (found) return { id: found.id, count: rows.length };
    rows.push({ id: visitorId, fp: fingerprint });
    writeFallback(rows);
    return { id: visitorId, count: rows.length };
  },
};

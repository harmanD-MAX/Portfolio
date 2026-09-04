import { Pool } from "pg";

let pool: Pool | null = null;
let connectionTested = false;
let isPostgresRunning = false;

export function getPostgresPool(): Pool | null {
  const connectionString =
    process.env.POSTGRES_URL ||
    process.env.DATABASE_URL ||
    process.env.SUPABASE_DB_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.POSTGRES_URL_NON_POOLING;

  if (!connectionString) {
    return null;
  }

  if (!pool) {
    const isRemote =
      connectionString.includes("supabase") ||
      connectionString.includes("sslmode") ||
      !connectionString.includes("localhost");

    pool = new Pool({
      connectionString,
      ssl:
        process.env.NODE_ENV === "production" || isRemote
          ? { rejectUnauthorized: false }
          : undefined,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });
  }
  return pool;
}

export async function initPostgresSchema(): Promise<boolean> {
  if (connectionTested) {
    return isPostgresRunning;
  }

  const dbPool = getPostgresPool();
  if (!dbPool) {
    connectionTested = true;
    isPostgresRunning = false;
    return false;
  }

  try {
    const client = await dbPool.connect();
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS blogs (
          id VARCHAR(128) PRIMARY KEY,
          slug VARCHAR(255) NOT NULL UNIQUE,
          title VARCHAR(512) NOT NULL,
          excerpt TEXT,
          content TEXT NOT NULL,
          category VARCHAR(128) NOT NULL DEFAULT 'Algorithms',
          tags JSONB NOT NULL DEFAULT '[]'::jsonb,
          read_time VARCHAR(64) NOT NULL DEFAULT '5 min read',
          published_at VARCHAR(64) NOT NULL,
          updated_at VARCHAR(64) NULL,
          is_draft BOOLEAN NOT NULL DEFAULT FALSE,
          author_name VARCHAR(128) NOT NULL DEFAULT 'Harman',
          author_role VARCHAR(256) NOT NULL DEFAULT 'Backend & Distributed Systems Engineer',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          modified_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );

        CREATE INDEX IF NOT EXISTS idx_blogs_slug ON blogs(slug);
        CREATE INDEX IF NOT EXISTS idx_blogs_category ON blogs(category);
        CREATE INDEX IF NOT EXISTS idx_blogs_draft ON blogs(is_draft);
      `);

      isPostgresRunning = true;
      connectionTested = true;
      return true;
    } finally {
      client.release();
    }
  } catch (error) {
    connectionTested = true;
    isPostgresRunning = false;
    return false;
  }
}

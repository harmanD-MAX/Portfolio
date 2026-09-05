import { Pool } from "pg";

const globalForPg = globalThis as unknown as {
  pgPool?: Pool;
  connectionTested?: boolean;
  isPostgresRunning?: boolean;
};

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

  if (!globalForPg.pgPool) {
    const isRemote =
      connectionString.includes("supabase") ||
      connectionString.includes("aws") ||
      connectionString.includes("sslmode") ||
      !connectionString.includes("localhost");

    globalForPg.pgPool = new Pool({
      connectionString: connectionString.trim().replace(/^["']|["']$/g, ""),
      ssl:
        process.env.NODE_ENV === "production" || isRemote
          ? { rejectUnauthorized: false }
          : undefined,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 8000,
    });
  }
  return globalForPg.pgPool;
}

export async function initPostgresSchema(): Promise<boolean> {
  if (globalForPg.connectionTested) {
    return Boolean(globalForPg.isPostgresRunning);
  }

  const dbPool = getPostgresPool();
  if (!dbPool) {
    globalForPg.connectionTested = true;
    globalForPg.isPostgresRunning = false;
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
          views INTEGER NOT NULL DEFAULT 0,
          likes INTEGER NOT NULL DEFAULT 0,
          author_name VARCHAR(128) NOT NULL DEFAULT 'Harman',
          author_role VARCHAR(256) NOT NULL DEFAULT 'Backend & Distributed Systems Engineer',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          modified_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );

        ALTER TABLE blogs ADD COLUMN IF NOT EXISTS views INTEGER NOT NULL DEFAULT 0;
        ALTER TABLE blogs ADD COLUMN IF NOT EXISTS likes INTEGER NOT NULL DEFAULT 0;

        CREATE INDEX IF NOT EXISTS idx_blogs_slug ON blogs(slug);
        CREATE INDEX IF NOT EXISTS idx_blogs_category ON blogs(category);
        CREATE INDEX IF NOT EXISTS idx_blogs_draft ON blogs(is_draft);
      `);

      globalForPg.isPostgresRunning = true;
      globalForPg.connectionTested = true;
      return true;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("PostgreSQL initialization error:", error);
    globalForPg.connectionTested = true;
    globalForPg.isPostgresRunning = false;
    return false;
  }
}

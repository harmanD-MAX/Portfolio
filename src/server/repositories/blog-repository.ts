import fs from "fs";
import path from "path";
import { getPostgresPool, initPostgresSchema } from "../db/postgres";

export type BlogEntity = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string[];
  readTime: string;
  publishedAt: string;
  updatedAt?: string;
  isDraft: boolean;
  author: {
    name: string;
    signature: string;
    role: string;
  };
};

const BACKUP_FILE = path.join(process.cwd(), "src", "server", "db", "data", "blogs.json");

function getBackupBlogs(): BlogEntity[] {
  try {
    if (fs.existsSync(BACKUP_FILE)) {
      const data = fs.readFileSync(BACKUP_FILE, "utf-8");
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn("Failed to read backup blogs.json:", err);
  }
  return [];
}

function saveBackupBlogs(blogs: BlogEntity[]) {
  try {
    fs.mkdirSync(path.dirname(BACKUP_FILE), { recursive: true });
    fs.writeFileSync(BACKUP_FILE, JSON.stringify(blogs, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to save backup blogs.json:", err);
  }
}

let schemaInitialized = false;
async function ensureSchema() {
  if (!schemaInitialized) {
    try {
      await initPostgresSchema();
      schemaInitialized = true;
    } catch {
      // PostgreSQL unreachable, fallback active
    }
  }
}

function mapRowToBlogEntity(row: any): BlogEntity {
  let tags: string[] = [];
  try {
    tags = typeof row.tags === "string" ? JSON.parse(row.tags) : row.tags || [];
  } catch {
    tags = [];
  }

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt || "",
    content: row.content || "",
    category: row.category || "Algorithms",
    tags: Array.isArray(tags) ? tags : [],
    readTime: row.read_time || "5 min read",
    publishedAt: row.published_at || "",
    updatedAt: row.updated_at || undefined,
    isDraft: Boolean(row.is_draft),
    author: {
      name: "Harman",
      signature: "Harmanpreet Singh",
      role: row.author_role || "Backend & Distributed Systems Engineer",
    },
  };
}

export class BlogRepository {
  static async findAll(options?: {
    includeDrafts?: boolean;
    category?: string;
    search?: string;
  }): Promise<BlogEntity[]> {
    try {
      await ensureSchema();
      const pool = getPostgresPool();

      if (pool) {
        let query = "SELECT * FROM blogs WHERE 1=1";
        const params: any[] = [];

        if (!options?.includeDrafts) {
          query += " AND is_draft = false";
        }

        if (options?.category && options.category !== "All") {
          params.push(options.category);
          query += ` AND category = $${params.length}`;
        }

        if (options?.search && options.search.trim()) {
          params.push(`%${options.search.trim().toLowerCase()}%`);
          query += ` AND (LOWER(title) LIKE $${params.length} OR LOWER(excerpt) LIKE $${params.length})`;
        }

        query += " ORDER BY created_at DESC";

        const res = await pool.query(query, params);
        if (res.rows && res.rows.length > 0) {
          return res.rows.map(mapRowToBlogEntity);
        }
      }
    } catch (err) {
      console.warn("PostgreSQL findAll error, using backup store:", err);
    }

    // Fallback backup store
    const list = getBackupBlogs();
    return list.filter((b) => {
      if (!options?.includeDrafts && b.isDraft) return false;
      if (options?.category && options.category !== "All" && b.category !== options.category) {
        return false;
      }
      if (options?.search && options.search.trim()) {
        const q = options.search.toLowerCase();
        const inTitle = b.title.toLowerCase().includes(q);
        const inExcerpt = b.excerpt.toLowerCase().includes(q);
        const inTags = b.tags.some((t) => t.toLowerCase().includes(q));
        if (!inTitle && !inExcerpt && !inTags) return false;
      }
      return true;
    });
  }

  static async findBySlugOrId(slugOrId: string): Promise<BlogEntity | null> {
    try {
      await ensureSchema();
      const pool = getPostgresPool();

      if (pool) {
        const res = await pool.query(
          "SELECT * FROM blogs WHERE slug = $1 OR id = $1 LIMIT 1",
          [slugOrId]
        );
        if (res.rows && res.rows.length > 0) {
          return mapRowToBlogEntity(res.rows[0]);
        }
      }
    } catch (err) {
      console.warn("PostgreSQL findBySlugOrId error, checking backup store:", err);
    }

    const list = getBackupBlogs();
    const found = list.find((b) => b.slug === slugOrId || b.id === slugOrId);
    return found || null;
  }

  static async create(blog: Omit<BlogEntity, "id" | "publishedAt">): Promise<BlogEntity> {
    const id = `blog-${Date.now()}`;
    const publishedAt = new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });

    const newEntity: BlogEntity = {
      ...blog,
      id,
      publishedAt,
      author: {
        name: "Harman",
        signature: "Harmanpreet Singh",
        role: blog.author?.role || "Backend & Distributed Systems Engineer",
      },
    };

    // Save to backup file
    const list = getBackupBlogs();
    list.unshift(newEntity);
    saveBackupBlogs(list);

    // Save to Supabase PostgreSQL
    try {
      await ensureSchema();
      const pool = getPostgresPool();
      if (pool) {
        await pool.query(
          `INSERT INTO blogs (
            id, slug, title, excerpt, content, category, tags, read_time, published_at, is_draft, author_name, author_role
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
          [
            id,
            blog.slug,
            blog.title,
            blog.excerpt,
            blog.content,
            blog.category,
            JSON.stringify(blog.tags || []),
            blog.readTime,
            publishedAt,
            blog.isDraft,
            "Harman",
            blog.author?.role || "Backend & Distributed Systems Engineer",
          ]
        );
      }
    } catch (err) {
      console.warn("PostgreSQL insert warning (data preserved in backup):", err);
    }

    return newEntity;
  }

  static async update(slugOrId: string, updates: Partial<BlogEntity>): Promise<BlogEntity | null> {
    const list = getBackupBlogs();
    const index = list.findIndex((b) => b.slug === slugOrId || b.id === slugOrId);

    const updatedAt = new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });

    let updated: BlogEntity;
    if (index !== -1) {
      updated = {
        ...list[index],
        ...updates,
        updatedAt,
        author: {
          name: "Harman",
          signature: "Harmanpreet Singh",
          role: "Backend & Distributed Systems Engineer",
        },
      };
      list[index] = updated;
      saveBackupBlogs(list);
    } else {
      const existing = await BlogRepository.findBySlugOrId(slugOrId);
      if (!existing) return null;
      updated = {
        ...existing,
        ...updates,
        updatedAt,
      };
    }

    // Update in Supabase PostgreSQL
    try {
      await ensureSchema();
      const pool = getPostgresPool();
      if (pool) {
        const fields: string[] = [];
        const params: any[] = [];
        let paramIdx = 1;

        if (updates.title !== undefined) {
          fields.push(`title = $${paramIdx++}`);
          params.push(updates.title);
        }
        if (updates.slug !== undefined) {
          fields.push(`slug = $${paramIdx++}`);
          params.push(updates.slug);
        }
        if (updates.excerpt !== undefined) {
          fields.push(`excerpt = $${paramIdx++}`);
          params.push(updates.excerpt);
        }
        if (updates.content !== undefined) {
          fields.push(`content = $${paramIdx++}`);
          params.push(updates.content);
        }
        if (updates.category !== undefined) {
          fields.push(`category = $${paramIdx++}`);
          params.push(updates.category);
        }
        if (updates.tags !== undefined) {
          fields.push(`tags = $${paramIdx++}`);
          params.push(JSON.stringify(updates.tags));
        }
        if (updates.readTime !== undefined) {
          fields.push(`read_time = $${paramIdx++}`);
          params.push(updates.readTime);
        }
        if (updates.isDraft !== undefined) {
          fields.push(`is_draft = $${paramIdx++}`);
          params.push(updates.isDraft);
        }

        fields.push(`updated_at = $${paramIdx++}`);
        params.push(updatedAt);

        fields.push(`modified_at = CURRENT_TIMESTAMP`);

        params.push(slugOrId);
        await pool.query(
          `UPDATE blogs SET ${fields.join(", ")} WHERE slug = $${paramIdx} OR id = $${paramIdx}`,
          params
        );
      }
    } catch (err) {
      console.warn("PostgreSQL update warning:", err);
    }

    return updated;
  }

  static async delete(slugOrId: string): Promise<boolean> {
    const list = getBackupBlogs();
    const filtered = list.filter((b) => b.slug !== slugOrId && b.id !== slugOrId);
    if (filtered.length !== list.length) {
      saveBackupBlogs(filtered);
    }

    try {
      await ensureSchema();
      const pool = getPostgresPool();
      if (pool) {
        const res = await pool.query("DELETE FROM blogs WHERE slug = $1 OR id = $1", [slugOrId]);
        return (res.rowCount ?? 0) > 0 || filtered.length !== list.length;
      }
    } catch (err) {
      console.warn("PostgreSQL delete warning:", err);
    }

    return filtered.length !== list.length;
  }
}

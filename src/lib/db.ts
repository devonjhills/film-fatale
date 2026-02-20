import { neon } from '@neondatabase/serverless';

const databaseUrl = process.env.POSTGRES_URL || process.env.DATABASE_URL || "";

type QueryResult = Record<string, unknown>;

type QueryFunction = {
  (strings: TemplateStringsArray, ...values: unknown[]): Promise<QueryResult[]>;
  (query: string, params?: unknown[]): Promise<QueryResult[]>;
};

const neonSql = databaseUrl ? (neon(databaseUrl) as unknown as QueryFunction) : null;

/**
 * A drop-in replacement for @vercel/postgres 'sql'
 */
export const sql = Object.assign(
  async (strings: TemplateStringsArray | string, ...values: unknown[]) => {
    if (!neonSql) {
      throw new Error("No database connection string found");
    }

    // Handle template literal: sql`SELECT...`
    if (Array.isArray(strings)) {
      const rows = await neonSql(strings as TemplateStringsArray, ...values);
      return { rows };
    }

    // Handle direct string call: sql("SELECT...", [...])
    const rows = await neonSql(strings as string, values[0] as unknown[] || []);
    return { rows };
  },
  {
    query: async (query: string, params: unknown[] = []) => {
      if (!neonSql) {
        throw new Error("No database connection string found");
      }
      const rows = await neonSql(query, params);
      return { rows };
    }
  }
// eslint-disable-next-line @typescript-eslint/no-explicit-any
) as any; // Maintains compatibility with @vercel/postgres signature expected by other modules

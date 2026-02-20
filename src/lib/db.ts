import { neon } from '@neondatabase/serverless';

const databaseUrl = process.env.POSTGRES_URL || process.env.DATABASE_URL || "";

// Define a more flexible type for the Neon client to support both tagged templates and direct calls
type QueryFunction = {
  (strings: TemplateStringsArray, ...values: any[]): Promise<any>;
  (query: string, params?: any[]): Promise<any>;
};

const neonSql = databaseUrl ? (neon(databaseUrl) as unknown as QueryFunction) : null;

/**
 * A drop-in replacement for @vercel/postgres 'sql'
 */
export const sql = Object.assign(
  async (strings: TemplateStringsArray | string, ...values: any[]) => {
    if (!neonSql) {
      throw new Error("No database connection string found");
    }

    // Handle template literal: sql`SELECT...`
    if (Array.isArray(strings)) {
      const rows = await neonSql(strings as TemplateStringsArray, ...values);
      return { rows };
    } 
    
    // Handle direct string call: sql("SELECT...", [...])
    const rows = await neonSql(strings as string, values[0] || []);
    return { rows };
  },
  {
    query: async (query: string, params: any[] = []) => {
      if (!neonSql) {
        throw new Error("No database connection string found");
      }
      const rows = await neonSql(query, params);
      return { rows };
    }
  }
) as any; // Keeping the final cast as any to maintain compatibility with @vercel/postgres signature expected by other modules


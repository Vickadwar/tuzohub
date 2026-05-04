import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";
import * as dotenv from "dotenv";
import { sql } from "drizzle-orm";

dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const db = drizzle(pool, { schema });

/**
 * Executes a database operation scoped to a specific user and tenant.
 * This sets the PostgreSQL session variables that Supabase RLS policies expect.
 */
export const withScopedDb = async <T>(
  userId: string, 
  role: string = "authenticated",
  callback: (tx: any) => Promise<T>
): Promise<T> => {
  return await db.transaction(async (tx) => {
    await tx.execute(sql`
      SELECT 
        set_config('request.jwt.claim.sub', ${userId}, true),
        set_config('request.jwt.claim.role', ${role}, true)
    `);
    return await callback(tx);
  });
};
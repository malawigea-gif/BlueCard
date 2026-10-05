import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// Prisma "client" engine (no Rust engine) + node-postgres adapter — works on Windows, Linux and Vercel.
// DATABASE_URL: PostgreSQL connection string (on Supabase use the pooled "Transaction" connection, port 6543).
function create() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set — add your PostgreSQL / Supabase connection string to .env");
  // serverless functions open few connections each; the Supabase pooler shares them
  return new PrismaClient({ adapter: new PrismaPg({ connectionString: url, max: process.env.VERCEL ? 3 : 10 }) });
}

const g = globalThis as unknown as { prisma?: PrismaClient };
export const db = g.prisma ?? create();
if (process.env.NODE_ENV !== "production") g.prisma = db;

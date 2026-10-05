import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// Prisma "client" engine (no Rust engine) + node-postgres adapter — works on Windows, Linux and Vercel.
// DATABASE_URL: PostgreSQL connection string (on Supabase use the pooled "Transaction" connection, port 6543).
function create() {
  const raw = (process.env.DATABASE_URL ?? "").trim().replace(/^["']|["']$/g, "");
  if (!raw) throw new Error("DATABASE_URL is not set — add your PostgreSQL / Supabase connection string to .env");
  // The URL is split into its parts here, so a password with special characters (written as %40 etc.) always works
  const u = new URL(raw);
  const ssl = u.searchParams.get("sslmode");
  return new PrismaClient({
    adapter: new PrismaPg({
      host: u.hostname,
      port: Number(u.port || 5432),
      user: decodeURIComponent(u.username),
      password: decodeURIComponent(u.password),
      database: decodeURIComponent(u.pathname.replace(/^\//, "") || "postgres"),
      ssl: ssl && ssl !== "disable" ? { rejectUnauthorized: false } : undefined,
      // serverless functions open few connections each; the Supabase pooler shares them
      max: process.env.VERCEL ? 3 : 10,
    }),
  });
}

const g = globalThis as unknown as { prisma?: PrismaClient };
export const db = g.prisma ?? create();
if (process.env.NODE_ENV !== "production") g.prisma = db;

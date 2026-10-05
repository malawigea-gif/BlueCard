import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

// Health check: shows whether the site can reach the database (no passwords or keys are shown).
export async function GET() {
  const raw = process.env.DATABASE_URL ?? "";
  let target = "not set";
  try {
    const u = new URL(raw);
    target = `${u.protocol}//${u.username}:****@${u.host}${u.pathname}`;
  } catch {
    target = raw ? `invalid URL (starts with ${JSON.stringify(raw.slice(0, 12))})` : "not set";
  }
  // shape of each setting (never the secret itself)
  const shape = (k: string) => {
    const v = process.env[k] ?? "";
    if (!v) return "missing";
    if (/^["']|["']$/.test(v)) return "has quote marks — remove them";
    if (k.endsWith("_URL")) { try { const u = new URL(v); return `ok (${u.protocol}//${u.host})`; } catch { return "not a valid URL"; } }
    return `ok (${v.length} characters)`;
  };
  const env = Object.fromEntries(["DATABASE_URL", "DIRECT_URL", "SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY", "AUTH_SECRET", "SITE_URL"].map((k) => [k, shape(k)]));
  try {
    const [users, articles] = await Promise.all([db.user.count(), db.article.count()]);
    return Response.json({ ok: true, database: target, users, articles, env });
  } catch (e) {
    const err = e as Error & { code?: string };
    const message = String(err.message || err).replace(/postgres(ql)?:\/\/[^\s"']+/g, "postgresql://****");
    return Response.json({ ok: false, database: target, code: err.code ?? null, error: message.slice(-1500), env }, { status: 500 });
  }
}

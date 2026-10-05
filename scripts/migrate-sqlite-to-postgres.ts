// Copies everything from the old local SQLite database (prisma/dev.db) and the ./uploads folder
// to the new PostgreSQL database (Supabase) and Supabase Storage.
//
//   1. Put the Supabase settings in .env (DATABASE_URL, DIRECT_URL, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
//   2. npm run db:push                     ← creates the empty tables (do NOT run "npm run setup" first)
//   3. npm run db:migrate-from-sqlite      ← this script
//
// Options:  --sqlite=path/to/dev.db   (default prisma/dev.db)    --skip-files   (do not upload ./uploads)
import { readdir, readFile } from "fs/promises";
import path from "path";
import { createClient } from "@libsql/client";
import { Prisma, PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { putFile, storageKind, UPLOAD_DIR } from "../src/lib/storage";

const arg = (name: string) => process.argv.find((a) => a.startsWith(`--${name}`))?.split("=")[1] ?? (process.argv.includes(`--${name}`) ? "1" : "");
const sqlitePath = path.resolve(arg("sqlite") || "prisma/dev.db");
const target = process.env.DIRECT_URL || process.env.DATABASE_URL;
if (!target) throw new Error("DATABASE_URL / DIRECT_URL is not set in .env");

// parents before children, so foreign keys are satisfied
const ORDER = ["User", "Registration", "MemberDocument", "Article", "Program", "GalleryImage", "Partner", "Setting", "ContactMessage", "AuditLog", "AssessmentAttempt", "AssessmentAnswer", "Payment", "Interview"];

const src = createClient({ url: `file:${sqlitePath}` });
const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: target }) });
const delegate = (model: string) => (db as unknown as Record<string, { count(): Promise<number>; createMany(a: { data: unknown[] }): Promise<{ count: number }> }>)[model[0].toLowerCase() + model.slice(1)];

function convert(type: string, v: unknown) {
  if (v === null || v === undefined) return v;
  switch (type) {
    case "DateTime": return new Date(typeof v === "number" || /^\d+$/.test(String(v)) ? Number(v) : String(v));
    case "Boolean": return v === true || v === 1 || v === "1" || v === "true" || (typeof v === "bigint" && v !== BigInt(0));
    case "Int": return Number(v);
    case "Float": return Number(v);
    default: return typeof v === "bigint" ? v.toString() : String(v);
  }
}

const TYPES: Record<string, string> = { jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", webp: "image/webp", gif: "image/gif", svg: "image/svg+xml", pdf: "application/pdf" };

async function uploadFolder(dir: string, prefix: string) {
  let n = 0;
  let entries: import("fs").Dirent[] = [];
  try { entries = await readdir(dir, { withFileTypes: true }); } catch { return 0; }
  for (const e of entries) {
    if (!e.isFile() || e.name.startsWith(".")) continue;
    const ext = e.name.split(".").pop()?.toLowerCase() ?? "";
    await putFile(prefix + e.name, await readFile(path.join(dir, e.name)), TYPES[ext] ?? "application/octet-stream");
    n++;
    if (n % 20 === 0) console.log(`  … ${n} files`);
  }
  return n;
}

async function main() {
  console.log(`From SQLite: ${sqlitePath}`);
  console.log(`To PostgreSQL: ${target!.replace(/:[^:@/]+@/, ":****@")}\n`);

  const models = Prisma.dmmf.datamodel.models;
  const names = [...ORDER.filter((m) => models.some((x) => x.name === m)), ...models.map((m) => m.name).filter((m) => !ORDER.includes(m))];
  const tables = new Set((await src.execute("SELECT name FROM sqlite_master WHERE type='table'")).rows.map((r) => String(r.name)));

  for (const name of names) {
    if ((await delegate(name).count()) > 0) {
      throw new Error(`The table "${name}" in PostgreSQL already has data. Run this script only on an empty database (after "npm run db:push", without "npm run setup").`);
    }
  }

  for (const name of names) {
    if (!tables.has(name)) { console.log(`- ${name}: not in the old database, skipped`); continue; }
    const model = models.find((m) => m.name === name)!;
    const fields = model.fields.filter((f) => f.kind === "scalar" || f.kind === "enum");
    const rows = (await src.execute(`SELECT * FROM "${name}"`)).rows;
    const data = rows.map((r) => {
      const o: Record<string, unknown> = {};
      for (const f of fields) if (f.name in r) o[f.name] = convert(f.type, r[f.name]);
      return o;
    });
    for (let i = 0; i < data.length; i += 500) await delegate(name).createMany({ data: data.slice(i, i + 500) });
    // continue the id numbering after the copied rows
    if (fields.some((f) => f.name === "id" && f.type === "Int")) {
      await db.$executeRawUnsafe(`SELECT setval(pg_get_serial_sequence('"${name}"', 'id'), COALESCE((SELECT MAX(id) FROM "${name}"), 1), (SELECT COUNT(*) FROM "${name}") > 0)`);
    }
    console.log(`✓ ${name}: ${data.length}`);
  }

  if (arg("skip-files")) console.log("\nFiles skipped (--skip-files).");
  else if (storageKind() !== "supabase") console.log("\n! SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY are not set — the ./uploads files were NOT copied.");
  else {
    console.log("\nUploading ./uploads to Supabase Storage …");
    const pub = await uploadFolder(UPLOAD_DIR, "");
    const priv = await uploadFolder(path.join(UPLOAD_DIR, "private"), "private/");
    console.log(`✓ Files: ${pub} public, ${priv} private`);
  }
  console.log("\nDone.");
}

main()
  .catch((e) => { console.error("\n✗", e instanceof Error ? e.message : e); process.exitCode = 1; })
  .finally(async () => { await db.$disconnect(); src.close(); });

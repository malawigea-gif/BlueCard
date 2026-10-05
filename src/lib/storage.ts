// Where uploaded files are kept.
// • Supabase Storage when SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set (needed on Vercel, whose disk is not permanent)
// • otherwise the local ./uploads folder (for running on your own computer or server)
// Keys look like "<name>" for public files and "private/<name>" for member photos and passport copies.
// The bucket is private: every file is served through /uploads/..., which checks who may see private files.
import { mkdir, readFile, unlink, writeFile } from "fs/promises";
import path from "path";

export const UPLOAD_DIR = path.join(process.cwd(), "uploads");

const env = (k: string) => (process.env[k] ?? "").trim();

function supabase() {
  const url = env("SUPABASE_URL").replace(/\/+$/, "");
  const key = env("SUPABASE_SERVICE_ROLE_KEY");
  return url && key ? { url, key, bucket: env("SUPABASE_BUCKET") || "uploads" } : null;
}

export function storageKind() {
  return supabase() ? "supabase" : "local";
}

const encodeKey = (key: string) => key.split("/").map(encodeURIComponent).join("/");

async function createBucket(s: NonNullable<ReturnType<typeof supabase>>) {
  await fetch(`${s.url}/storage/v1/bucket`, {
    method: "POST",
    headers: { Authorization: `Bearer ${s.key}`, apikey: s.key, "Content-Type": "application/json" },
    body: JSON.stringify({ id: s.bucket, name: s.bucket, public: false }),
  });
}

export async function putFile(key: string, data: Buffer, contentType: string) {
  const s = supabase();
  if (!s) {
    const file = path.join(UPLOAD_DIR, key);
    await mkdir(path.dirname(file), { recursive: true });
    await writeFile(file, data);
    return;
  }
  const send = () => fetch(`${s.url}/storage/v1/object/${s.bucket}/${encodeKey(key)}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${s.key}`, apikey: s.key, "Content-Type": contentType, "x-upsert": "true" },
    body: new Uint8Array(data),
  });
  let res = await send();
  if (!res.ok && (res.status === 404 || res.status === 400) && /bucket/i.test(await res.clone().text())) {
    await createBucket(s); // first upload: create the private bucket
    res = await send();
  }
  if (!res.ok) throw new Error(`Upload to storage failed (${res.status}): ${(await res.text()).slice(0, 200)}`);
}

export async function getFile(key: string): Promise<Buffer | null> {
  const s = supabase();
  if (!s) {
    try { return await readFile(path.join(UPLOAD_DIR, key)); } catch { return null; }
  }
  const res = await fetch(`${s.url}/storage/v1/object/${s.bucket}/${encodeKey(key)}`, {
    headers: { Authorization: `Bearer ${s.key}`, apikey: s.key },
    cache: "no-store",
  });
  if (!res.ok) return null;
  return Buffer.from(await res.arrayBuffer());
}

export async function deleteFile(key: string) {
  const s = supabase();
  if (!s) {
    try { await unlink(path.join(UPLOAD_DIR, key)); } catch {}
    return;
  }
  try {
    await fetch(`${s.url}/storage/v1/object/${s.bucket}/${encodeKey(key)}`, { method: "DELETE", headers: { Authorization: `Bearer ${s.key}`, apikey: s.key } });
  } catch {}
}

/** "/uploads/private/abc.jpg" → "private/abc.jpg"; null for anything that is not an upload URL. */
export function keyFromUrl(url?: string | null) {
  if (!url || !url.startsWith("/uploads/")) return null;
  const parts = url.slice("/uploads/".length).split("/");
  const name = path.basename(parts[parts.length - 1] ?? "");
  if (!name || name.startsWith(".")) return null;
  if (parts.length === 1) return name;
  if (parts.length === 2 && parts[0] === "private") return `private/${name}`;
  return null;
}

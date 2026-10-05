import "server-only";
import { randomUUID } from "crypto";
import { getT } from "./i18n/server";
import { deleteFile, keyFromUrl, putFile } from "./storage";

// Uploaded files are kept in Supabase Storage or the local ./uploads folder (see storage.ts)
// and served at /uploads/<name> (public) or /uploads/private/<name> (Admins and the owner only).
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const DOC_TYPES = [...IMAGE_TYPES, "application/pdf"];
// Vercel accepts at most 4.5 MB per request; large photos are made smaller in the browser first (ImageShrinker)
const MAX = 4 * 1024 * 1024;

export async function saveUpload(file: FormDataEntryValue | null, opts: { allowPdf?: boolean; private?: boolean } = {}) {
  if (!file || typeof file === "string" || file.size === 0) return null;
  const allowed = opts.allowPdf ? DOC_TYPES : IMAGE_TYPES;
  if (!allowed.includes(file.type) || file.size > MAX) {
    const { t } = await getT();
    if (file.size > MAX) throw new Error(t("upload.err.size"));
    throw new Error(t("upload.err.type", { types: "JPG, PNG, WEBP" + (opts.allowPdf ? ", PDF" : "") }));
  }
  const ext = (file.name.split(".").pop() || "bin").toLowerCase().replace(/[^a-z0-9]/g, "");
  const name = `${randomUUID()}.${ext}`;
  // Private files (passport copies, member photos, member documents) — visible only to Admins and the owner
  const key = opts.private ? `private/${name}` : name;
  await putFile(key, Buffer.from(await file.arrayBuffer()), file.type);
  return `/uploads/${key}`;
}

export async function saveUploads(files: FormDataEntryValue[]) {
  const out: string[] = [];
  for (const f of files) {
    const u = await saveUpload(f);
    if (u) out.push(u);
  }
  return out;
}

export async function removeUpload(url?: string | null) {
  const key = keyFromUrl(url);
  if (key) await deleteFile(key);
}

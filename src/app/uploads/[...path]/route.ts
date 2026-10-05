import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { getFile, keyFromUrl } from "@/lib/storage";

// Serves uploaded files at /uploads/<name> (from Supabase Storage or the local ./uploads folder).
// Files under /uploads/private (member photos, passport copies, member documents) are only served to Admins and the owning member.
const TYPES: Record<string, string> = {
  jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", webp: "image/webp",
  gif: "image/gif", svg: "image/svg+xml", pdf: "application/pdf",
};

export async function GET(_req: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const url = `/uploads/${((await params).path ?? []).join("/")}`;
  const key = keyFromUrl(url);
  if (!key) return new Response("Not found", { status: 404 });
  const isPrivate = key.startsWith("private/");

  if (isPrivate) {
    const s = await getSession();
    if (!s) return new Response("Forbidden", { status: 403 });
    if (s.role !== "ADMIN") {
      const reg = await db.registration.findFirst({ where: { userId: s.uid, OR: [{ photo: url }, { document: url }, { documents: { some: { file: url } } }] } });
      if (!reg) return new Response("Forbidden", { status: 403 });
    }
  }

  const data = await getFile(key);
  if (!data) return new Response("Not found", { status: 404 });
  const ext = key.split(".").pop()?.toLowerCase() ?? "";
  return new Response(new Uint8Array(data), {
    headers: {
      "Content-Type": TYPES[ext] ?? "application/octet-stream",
      // public files never change (new uploads get new names), so browsers and Vercel's CDN may keep them
      "Cache-Control": isPrivate ? "private, no-store" : "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
      ...(ext === "svg" ? { "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'" } : {}),
    },
  });
}

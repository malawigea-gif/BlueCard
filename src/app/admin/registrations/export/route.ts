import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { makeT, statusLabel, genderLabel } from "@/lib/i18n/dict";
import { getLocale } from "@/lib/i18n/server";
import { countryName } from "@/lib/geo";

export async function GET(req: Request) {
  const s = await getSession();
  if (!s || s.role !== "ADMIN") return new Response("Forbidden", { status: 403 });
  const locale = await getLocale();
  const t = makeT(locale);
  const url = new URL(req.url);
  const status = url.searchParams.get("status") || undefined;
  const country = url.searchParams.get("country") || undefined;
  const rows = await db.registration.findMany({ where: { ...(status ? { status } : {}), ...(country ? { country } : {}) }, orderBy: { createdAt: "asc" } });
  const head = ["Card No", "Full Name", "Passport No", "DOB", "Gender", "Address", "State / Province", "Country", "Phone", "Email", "Occupation", "Status", "Applied", "Reviewed"];
  const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const lines = rows.map((r) => [
    r.cardNo, r.fullName, r.nic, r.dob.toISOString().slice(0, 10), genderLabel(r.gender, t), r.address, r.district, countryName(r.country, locale), r.phone, r.email,
    r.occupation, statusLabel(r.status, t), r.createdAt.toISOString().slice(0, 10), r.reviewedAt?.toISOString().slice(0, 10),
  ].map(esc).join(","));
  const csv = "﻿" + [head.join(","), ...lines].join("\r\n"); // BOM — so Excel shows umlauts and other non-ASCII characters correctly
  return new Response(csv, {
    headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="bluecard-members-${new Date().toISOString().slice(0, 10)}.csv"` },
  });
}

import Link from "next/link";
import { db } from "@/lib/db";
import { STATUSES } from "@/lib/utils";
import { countryName } from "@/lib/geo";
import { STAGES } from "@/lib/journey";
import { getT } from "@/lib/i18n/server";
import { fmtDate, statusLabel } from "@/lib/i18n/dict";
import { PageTitle } from "@/components/admin/PageTitle";
import { Flash, type SP } from "@/components/admin/Flash";
import { StatusBadge } from "@/components/admin/StatusBadge";

export default async function Registrations({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const { t, locale } = await getT();
  const status = sp.status && (STATUSES as readonly string[]).includes(sp.status) ? sp.status : undefined;
  const q = sp.q?.trim();
  const country = sp.country || undefined;
  const where = {
    ...(status ? { status } : {}),
    ...(country ? { country } : {}),
    ...(q ? { OR: [{ fullName: { contains: q, mode: "insensitive" as const } }, { nic: { contains: q.toUpperCase() } }, { cardNo: { contains: q.toUpperCase() } }, { phone: { contains: q } }] } : {}),
  };
  const [items, counts] = await Promise.all([
    db.registration.findMany({ where, orderBy: { createdAt: "desc" }, take: 500 }),
    db.registration.groupBy({ by: ["status"], _count: true }),
  ]);
  const usedCountries = (await db.registration.findMany({ where: { country: { not: "" } }, select: { country: true }, distinct: ["country"] }))
    .map((r) => r.country).sort((a, b) => countryName(a, locale).localeCompare(countryName(b, locale)));
  const count = (s: string) => counts.find((c) => c.status === s)?._count ?? 0;
  const total = counts.reduce((a, c) => a + c._count, 0);
  const qs = new URLSearchParams({ ...(status ? { status } : {}), ...(q ? { q } : {}), ...(country ? { country } : {}) }).toString();
  const tabs = [["", t("common.all"), total] as const, ...STATUSES.map((k) => [k, statusLabel(k, t), count(k)] as const)];

  return (
    <>
      <PageTitle title={t("admin.nav.registrations")} sub={t("areg.sub")}
        action={<a href={`/admin/registrations/export${qs ? "?" + qs : ""}`} className="btn-outline">{t("areg.export")}</a>} />
      <Flash searchParams={searchParams} />
      <div className="mb-4 flex flex-wrap gap-2">
        {tabs.map(([k, label, n]) => (
          <Link key={k} href={`/admin/registrations${k ? `?status=${k}` : ""}`}
            className={`rounded-full px-4 py-1.5 text-sm font-medium ${(status ?? "") === k ? "bg-navy-700 text-white" : "bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"}`}>
            {label} <span className="opacity-70">({n})</span>
          </Link>
        ))}
      </div>
      <form className="mb-4 flex flex-wrap gap-2">
        {status && <input type="hidden" name="status" value={status} />}
        <input name="q" defaultValue={q} placeholder={t("areg.searchPh")} className="input max-w-sm" />
        <select name="country" defaultValue={country ?? ""} className="input w-auto">
          <option value="">{t("areg.allCountries")}</option>
          {usedCountries.map((c) => <option key={c} value={c}>{countryName(c, locale)}</option>)}
        </select>
        <button className="btn-primary">{t("common.search")}</button>
      </form>
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-600">
            <tr><th className="px-4 py-3">{t("areg.colName")}</th><th className="px-4 py-3">{t("areg.colNic")}</th><th className="px-4 py-3">{t("areg.colDistrict")}</th><th className="px-4 py-3">{t("areg.colCard")}</th><th className="px-4 py-3">{t("areg.colDate")}</th><th className="px-4 py-3">{t("areg.colStatus")}</th><th className="px-4 py-3">{t("areg.colStep")}</th><th /></tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map((r) => (
              <tr key={r.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-slate-900">{r.fullName}</td>
                <td className="px-4 py-3 font-mono text-xs">{r.nic}</td>
                <td className="px-4 py-3">{[r.district, countryName(r.country, locale)].filter(Boolean).join(", ")}</td>
                <td className="px-4 py-3 font-mono text-xs">{r.cardNo ?? "—"}</td>
                <td className="whitespace-nowrap px-4 py-3 text-slate-500">{fmtDate(r.createdAt, locale)}</td>
                <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                <td className="whitespace-nowrap px-4 py-3 text-xs text-slate-500">{r.status === "APPROVED" ? `${r.stage}/${STAGES.length}` : "—"}</td>
                <td className="px-4 py-3 text-right"><Link href={`/admin/registrations/${r.id}`} className="font-medium text-navy-600 hover:underline">{t("areg.view")}</Link></td>
              </tr>
            ))}
            {!items.length && <tr><td colSpan={8} className="px-4 py-8 text-center text-slate-500">{t("areg.empty")}</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}

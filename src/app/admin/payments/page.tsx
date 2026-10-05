import Link from "next/link";
import { db } from "@/lib/db";
import { getT } from "@/lib/i18n/server";
import { fmtDate, type DictKey } from "@/lib/i18n/dict";
import { FEES, FEE_KINDS, JOB_FEE_INTERVIEWS, JOB_FEE_VALID_DAYS, PAYMENT_STATUSES, fmtMoney, type FeeKind } from "@/lib/payments/config";
import { payhereConfig, payhereReady } from "@/lib/payments/payhere";
import { PageTitle } from "@/components/admin/PageTitle";
import { Flash, type SP } from "@/components/admin/Flash";
import { STATUS_BADGE } from "@/components/payments/FeesPanel";

export default async function AdminPayments({ searchParams }: { searchParams: SP }) {
  const { t, locale } = await getT();
  const sp = await searchParams;
  const status = (PAYMENT_STATUSES as readonly string[]).includes(sp.status ?? "") ? sp.status! : "";
  const kind = (FEE_KINDS as readonly string[]).includes(sp.kind ?? "") ? sp.kind! : "";
  const where = { ...(status ? { status } : {}), ...(kind ? { kind } : {}) };
  const [rows, totals] = await Promise.all([
    db.payment.findMany({ where, orderBy: { createdAt: "desc" }, take: 300, include: { user: { include: { registration: { select: { id: true, fullName: true, cardNo: true } } } } } }),
    db.payment.groupBy({ by: ["kind", "currency"], where: { status: "PAID" }, _sum: { amountCents: true }, _count: true }),
  ]);
  const c = payhereConfig();
  const link = (k: string, v: string) => {
    const q = new URLSearchParams({ ...(status ? { status } : {}), ...(kind ? { kind } : {}), [k]: v });
    if (!v) q.delete(k);
    const s = q.toString();
    return s ? `/admin/payments?${s}` : "/admin/payments";
  };
  const pill = (active: boolean) => `rounded-full px-3 py-1 text-sm font-medium ${active ? "bg-navy-700 text-white" : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"}`;

  return (
    <>
      <PageTitle title={t("apay.title")} sub={t("apay.sub", {
        job: fmtMoney(FEES.JOB_MATCHING.cents, FEES.JOB_MATCHING.currency, locale), days: JOB_FEE_VALID_DAYS, max: JOB_FEE_INTERVIEWS,
        visa: fmtMoney(FEES.VISA.cents, FEES.VISA.currency, locale),
      })} />
      <Flash searchParams={searchParams} />

      <div className={`mb-5 rounded-lg border px-4 py-3 text-sm ${payhereReady() ? (c.sandbox ? "border-amber-200 bg-amber-50 text-amber-800" : "border-emerald-200 bg-emerald-50 text-emerald-800") : "border-red-200 bg-red-50 text-red-700"}`}>
        {!payhereReady() ? t("apay.notConfigured") : c.sandbox ? t("apay.sandbox", { url: c.siteUrl }) : t("apay.live", { url: c.siteUrl })}
      </div>

      <div className="mb-5 grid gap-4 sm:grid-cols-2">
        {FEE_KINDS.map((k) => {
          const sum = totals.filter((x) => x.kind === k);
          return (
            <div key={k} className="card p-5">
              <div className="text-sm text-slate-500">{t(`pay.kind.${k}`)}</div>
              <div className="mt-1 text-2xl font-bold text-navy-900">{sum.length ? sum.map((x) => fmtMoney(x._sum.amountCents ?? 0, x.currency, locale)).join(" + ") : fmtMoney(0, FEES[k].currency, locale)}</div>
              <div className="text-xs text-slate-400">{t("apay.paidCount", { n: sum.reduce((a, x) => a + x._count, 0) })}</div>
            </div>
          );
        })}
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        <Link href={link("kind", "")} className={pill(!kind)}>{t("common.all")}</Link>
        {FEE_KINDS.map((k) => <Link key={k} href={link("kind", k)} className={pill(kind === k)}>{t(`pay.kind.${k}`)}</Link>)}
        <span className="mx-1 w-px bg-slate-200" />
        <Link href={link("status", "")} className={pill(!status)}>{t("common.all")}</Link>
        {PAYMENT_STATUSES.map((s) => <Link key={s} href={link("status", s)} className={pill(status === s)}>{t(`pay.status.${s}`)}</Link>)}
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">{t("aexam.colMember")}</th>
              <th className="px-4 py-3 font-medium">{t("pay.item")}</th>
              <th className="px-4 py-3 font-medium">{t("pay.amount")}</th>
              <th className="px-4 py-3 font-medium">{t("apay.colDate")}</th>
              <th className="px-4 py-3 font-medium">{t("apay.colMethod")}</th>
              <th className="px-4 py-3 font-medium">{t("apay.colStatus")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((p) => {
              const reg = p.user.registration;
              return (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    {reg ? <Link href={`/admin/registrations/${reg.id}`} className="font-medium text-navy-700 hover:underline">{reg.fullName}</Link> : <span className="font-medium">{p.user.name}</span>}
                    <div className="text-xs text-slate-400">{reg?.cardNo || p.user.email}</div>
                  </td>
                  <td className="px-4 py-3">{t(`pay.kind.${p.kind as FeeKind}`)}<div className="text-xs text-slate-400">{p.orderId}</div></td>
                  <td className="px-4 py-3 font-medium">{fmtMoney(p.amountCents, p.currency, locale)}</td>
                  <td className="px-4 py-3 text-slate-600">{fmtDate(p.paidAt ?? p.createdAt, locale)}</td>
                  <td className="px-4 py-3 text-slate-600">{p.method === "MANUAL" ? `${t("apay.manual")} — ${p.reference ?? ""}` : p.method || "—"}{p.payherePaymentId && <div className="text-xs text-slate-400">PayHere {p.payherePaymentId}</div>}</td>
                  <td className="px-4 py-3"><span className={`badge ${STATUS_BADGE[p.status] ?? ""}`}>{t(`pay.status.${p.status}` as DictKey)}</span></td>
                </tr>
              );
            })}
            {!rows.length && <tr><td colSpan={6} className="px-4 py-10 text-center text-slate-500">{t("apay.empty")}</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}

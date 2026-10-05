import Link from "next/link";
import { db } from "@/lib/db";
import { getT } from "@/lib/i18n/server";
import { fmtDate, type DictKey } from "@/lib/i18n/dict";
import { FEES, JOB_FEE_INTERVIEWS, JOB_FEE_VALID_DAYS, fmtMoney, type FeeKind } from "@/lib/payments/config";
import { payhereReady } from "@/lib/payments/payhere";
import { feeDue, getJobFee, visaFeePaid } from "@/lib/payments/status";
import { startPayment } from "@/app/actions/payments";

export const STATUS_BADGE: Record<string, string> = {
  PAID: "bg-emerald-100 text-emerald-700",
  PENDING: "bg-amber-100 text-amber-700",
  CANCELLED: "bg-slate-100 text-slate-600",
  FAILED: "bg-red-100 text-red-700",
  CHARGEDBACK: "bg-red-100 text-red-700",
};

/** "Pay €10 with PayHere" — a small form that starts the payment. */
export async function PayButton({ kind, className = "btn-gold" }: { kind: FeeKind; className?: string }) {
  const { t, locale } = await getT();
  if (!payhereReady()) return <p className="rounded-lg bg-slate-50 p-3 text-sm text-slate-600">{t("pay.err.notConfigured")}</p>;
  return (
    <form action={startPayment}>
      <input type="hidden" name="kind" value={kind} />
      <button className={className}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden><rect x="2" y="5" width="20" height="14" rx="2" /><path d="M2 10h20" /></svg>
        {t("pay.payBtn", { amount: fmtMoney(FEES[kind].cents, FEES[kind].currency, locale) })}
      </button>
    </form>
  );
}

/** Shown inside the current journey step when its fee still has to be paid. */
export async function FeeDueNotice({ kind, ended }: { kind: FeeKind; ended?: "time" | "interviews" | null }) {
  const { t, locale } = await getT();
  const amount = fmtMoney(FEES[kind].cents, FEES[kind].currency, locale);
  return (
    <div className="rounded-lg border-2 border-gold-400 bg-amber-50 p-4 text-sm">
      <div className="font-semibold text-slate-900">{t("pay.dueTitle", { amount })}</div>
      <p className="mt-1 leading-6 text-slate-700">
        {ended ? t(ended === "time" ? "pay.jobEndedTime" : "pay.jobEndedInterviews", { max: JOB_FEE_INTERVIEWS }) + " " : ""}
        {t(kind === "JOB_MATCHING" ? "pay.jobDueText" : "pay.visaDueText", { days: JOB_FEE_VALID_DAYS, max: JOB_FEE_INTERVIEWS })}
      </p>
      <div className="mt-3"><PayButton kind={kind} /></div>
    </div>
  );
}

/** Member profile: fees, interviews and payment history. */
export async function FeesPanel({ userId, stage, error }: { userId: number; stage: number; error?: string }) {
  const { t, locale } = await getT();
  const [job, visa, payments, interviews, jobDue, visaDue] = await Promise.all([
    getJobFee(userId),
    visaFeePaid(userId),
    db.payment.findMany({ where: { userId, NOT: { status: "PENDING", paidAt: null, createdAt: { lt: new Date(Date.now() - 86_400_000) } } }, orderBy: { createdAt: "desc" }, take: 20 }),
    db.interview.findMany({ where: { userId }, orderBy: { date: "desc" } }),
    feeDue(userId, stage, "JOB_MATCHING"),
    feeDue(userId, stage, "VISA"),
  ]);

  return (
    <section id="fees" className="card scroll-mt-24 p-6 md:p-8 print:hidden">
      <h2 className="text-xl font-bold text-navy-800">{t("pay.panelTitle")}</h2>
      <p className="mt-1 text-sm text-slate-500">{t("pay.panelSub")}</p>
      {error && <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        {/* job matching fee */}
        <div className="rounded-xl border border-slate-200 p-5">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="font-semibold text-slate-900">{t("pay.kind.JOB_MATCHING")}</div>
              <div className="text-sm text-slate-500">{fmtMoney(FEES.JOB_MATCHING.cents, FEES.JOB_MATCHING.currency, locale)} · {t("pay.jobTerms", { max: JOB_FEE_INTERVIEWS })}</div>
            </div>
            <span className={`badge ${job.active ? STATUS_BADGE.PAID : job.ended ? STATUS_BADGE.FAILED : "bg-slate-100 text-slate-600"}`}>
              {t(job.active ? "pay.valid" : job.ended ? "pay.expired" : "pay.notPaid")}
            </span>
          </div>
          {job.active && (
            <div className="mt-4">
              <div className="flex justify-between text-sm"><span className="text-slate-600">{t("pay.interviewsUsed", { n: job.active.used, max: JOB_FEE_INTERVIEWS })}</span><span className="text-slate-500">{t("pay.validUntilShort", { date: fmtDate(job.active.validUntil, locale) })}</span></div>
              <div className="mt-1.5 flex gap-1" aria-hidden>
                {Array.from({ length: JOB_FEE_INTERVIEWS }, (_, i) => <span key={i} className={`h-2 flex-1 rounded-full ${i < job.active!.used ? "bg-navy-600" : "bg-slate-200"}`} />)}
              </div>
            </div>
          )}
          {job.ended && !job.active && <p className="mt-3 text-sm text-slate-600">{t(job.ended === "time" ? "pay.jobEndedTime" : "pay.jobEndedInterviews", { max: JOB_FEE_INTERVIEWS })}</p>}
          {jobDue ? <div className="mt-4"><PayButton kind="JOB_MATCHING" /></div>
            : !job.active && <p className="mt-3 text-xs text-slate-400">{t("pay.jobWhen")}</p>}
        </div>

        {/* visa fee */}
        <div className="rounded-xl border border-slate-200 p-5">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="font-semibold text-slate-900">{t("pay.kind.VISA")}</div>
              <div className="text-sm text-slate-500">{fmtMoney(FEES.VISA.cents, FEES.VISA.currency, locale)} · {t("pay.visaTerms")}</div>
            </div>
            <span className={`badge ${visa ? STATUS_BADGE.PAID : "bg-slate-100 text-slate-600"}`}>{t(visa ? "pay.status.PAID" : "pay.notPaid")}</span>
          </div>
          {visaDue ? <div className="mt-4"><PayButton kind="VISA" /></div>
            : !visa && <p className="mt-3 text-xs text-slate-400">{t("pay.visaWhen")}</p>}
        </div>
      </div>

      {interviews.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-bold text-slate-800">{t("pay.interviewsTitle")}</h3>
          <ul className="mt-2 divide-y divide-slate-100 text-sm">
            {interviews.map((iv) => (
              <li key={iv.id} className="flex flex-wrap justify-between gap-2 py-2">
                <span className="font-medium text-slate-800">{iv.employer}</span>
                <span className="text-slate-500">{fmtDate(iv.date, locale)}{iv.note ? ` · ${iv.note}` : ""}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {payments.length > 0 && (
        <div className="mt-6 overflow-x-auto">
          <h3 className="text-sm font-bold text-slate-800">{t("pay.historyTitle")}</h3>
          <table className="mt-2 w-full text-sm">
            <tbody className="divide-y divide-slate-100">
              {payments.map((p) => (
                <tr key={p.id}>
                  <td className="py-2 pr-3 text-slate-600">{fmtDate(p.paidAt ?? p.createdAt, locale)}</td>
                  <td className="py-2 pr-3 text-slate-800">{t(`pay.kind.${p.kind as FeeKind}`)}</td>
                  <td className="py-2 pr-3 text-slate-800">{fmtMoney(p.amountCents, p.currency, locale)}</td>
                  <td className="py-2 pr-3"><span className={`badge ${STATUS_BADGE[p.status] ?? ""}`}>{t(`pay.status.${p.status}` as DictKey)}</span></td>
                  <td className="py-2 text-right"><Link href={`/profile/pay/${p.orderId}`} className="text-navy-600 hover:underline">{t("pay.receipt")}</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

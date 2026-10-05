import { db } from "@/lib/db";
import { getT } from "@/lib/i18n/server";
import { fmtDate, type DictKey } from "@/lib/i18n/dict";
import { FEES, FEE_KINDS, JOB_FEE_INTERVIEWS, fmtMoney, type FeeKind } from "@/lib/payments/config";
import { getJobFee, visaFeePaid } from "@/lib/payments/status";
import { addInterview, deleteInterview, recordManualPayment } from "@/app/actions/payments";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { STATUS_BADGE } from "./FeesPanel";

/** Admin › registration: fee status, manual payments and interviews of one member. */
export async function FeesAdmin({ registrationId, userId }: { registrationId: number; userId: number }) {
  const { t, locale } = await getT();
  const [job, visa, payments, interviews] = await Promise.all([
    getJobFee(userId),
    visaFeePaid(userId),
    db.payment.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 15 }),
    db.interview.findMany({ where: { userId }, orderBy: { date: "desc" } }),
  ]);
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="card p-5">
      <h2 className="font-bold text-slate-800">{t("apay.panelTitle")}</h2>
      <dl className="mt-3 space-y-2 text-sm">
        <div className="flex items-center justify-between gap-2">
          <dt className="text-slate-600">{t("pay.kind.JOB_MATCHING")}</dt>
          <dd className="shrink-0 whitespace-nowrap">{job.active
            ? <span className={`badge ${STATUS_BADGE.PAID}`}>{t("apay.jobActive", { n: job.active.used, max: JOB_FEE_INTERVIEWS, date: job.active.validUntil.toISOString().slice(0, 10) })}</span>
            : <span className={`badge ${job.ended ? STATUS_BADGE.FAILED : "bg-slate-100 text-slate-600"}`}>{t(job.ended ? "pay.expired" : "pay.notPaid")}</span>}</dd>
        </div>
        <div className="flex items-center justify-between gap-2">
          <dt className="text-slate-600">{t("pay.kind.VISA")}</dt>
          <dd><span className={`badge ${visa ? STATUS_BADGE.PAID : "bg-slate-100 text-slate-600"}`}>{t(visa ? "pay.status.PAID" : "pay.notPaid")}</span></dd>
        </div>
      </dl>

      {/* interviews */}
      <div className="mt-5 border-t border-slate-100 pt-4">
        <h3 className="text-sm font-bold text-slate-800">{t("pay.interviewsTitle")}</h3>
        {interviews.length ? (
          <ul className="mt-2 divide-y divide-slate-100 text-sm">
            {interviews.map((iv) => (
              <li key={iv.id} className="flex items-start justify-between gap-2 py-2">
                <span className="min-w-0"><span className="font-medium">{iv.employer}</span><span className="block text-xs text-slate-400">{iv.date.toISOString().slice(0, 10)}{iv.note ? ` · ${iv.note}` : ""}</span></span>
                <form action={deleteInterview}>
                  <input type="hidden" name="id" value={registrationId} />
                  <input type="hidden" name="interview" value={iv.id} />
                  <ConfirmButton className="text-xs text-red-600 hover:underline" message={t("apay.interviewDeleteConfirm")}>{t("common.delete")}</ConfirmButton>
                </form>
              </li>
            ))}
          </ul>
        ) : <p className="mt-1 text-sm text-slate-500">{t("apay.noInterviews")}</p>}
        {job.active ? (
          <form action={addInterview} className="mt-3 grid gap-2">
            <input type="hidden" name="id" value={registrationId} />
            <input name="employer" className="input" placeholder={t("apay.employerPh")} required maxLength={160} />
            <div className="grid grid-cols-2 gap-2">
              <input name="date" type="date" className="input" defaultValue={today} required />
              <input name="note" className="input" placeholder={t("apay.notePh")} maxLength={300} />
            </div>
            <button className="btn-outline w-full">{t("apay.addInterview", { left: job.active.left })}</button>
          </form>
        ) : <p className="mt-2 text-xs text-amber-700">{t("apay.err.noJobFee")}</p>}
      </div>

      {/* manual payment */}
      <details className="mt-5 border-t border-slate-100 pt-4">
        <summary className="cursor-pointer text-sm font-bold text-slate-800">{t("apay.manualTitle")}</summary>
        <form action={recordManualPayment} className="mt-3 grid gap-2">
          <input type="hidden" name="id" value={registrationId} />
          <select name="kind" className="input" defaultValue="JOB_MATCHING">
            {FEE_KINDS.map((k) => <option key={k} value={k}>{t(`pay.kind.${k}`)} — {fmtMoney(FEES[k].cents, FEES[k].currency, locale)}</option>)}
          </select>
          <input name="reference" className="input" placeholder={t("apay.referencePh")} required maxLength={120} />
          <ConfirmButton className="btn-outline w-full" message={t("apay.manualConfirm")}>{t("apay.manualBtn")}</ConfirmButton>
        </form>
      </details>

      {payments.length > 0 && (
        <div className="mt-5 border-t border-slate-100 pt-4">
          <h3 className="text-sm font-bold text-slate-800">{t("pay.historyTitle")}</h3>
          <ul className="mt-2 divide-y divide-slate-100 text-sm">
            {payments.map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-2 py-2">
                <span className="min-w-0">
                  <span className="font-medium">{t(`pay.kind.${p.kind as FeeKind}`)}</span>
                  <span className="block truncate text-xs text-slate-400">{fmtDate(p.paidAt ?? p.createdAt, locale)} · {p.method === "MANUAL" ? `${t("apay.manual")}: ${p.reference ?? ""}` : p.orderId}</span>
                </span>
                <span className={`badge shrink-0 ${STATUS_BADGE[p.status] ?? ""}`}>{t(`pay.status.${p.status}` as DictKey)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

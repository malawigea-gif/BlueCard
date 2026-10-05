import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getT } from "@/lib/i18n/server";
import { fmtDate, genderLabel, type DictKey } from "@/lib/i18n/dict";
import { countryName } from "@/lib/geo";
import { STAGES } from "@/lib/journey";
import { setRegistrationStage, approveRegistration, rejectRegistration, resetRegistration, deleteRegistration } from "@/app/actions/admin";
import { PageTitle } from "@/components/admin/PageTitle";
import { Flash, type SP } from "@/components/admin/Flash";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { MAX_ATTEMPTS, passed } from "@/lib/assessment/config";
import { closeExpired } from "@/lib/assessment/engine";
import { deleteAssessmentAttempt } from "@/app/actions/assessment";
import { FeesAdmin } from "@/components/payments/FeesAdmin";

export default async function RegistrationDetail({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: SP }) {
  const r = await db.registration.findUnique({ where: { id: Number((await params).id) }, include: { user: true, documents: { orderBy: { createdAt: "desc" } } } });
  if (!r) notFound();
  const { t, locale } = await getT();
  await closeExpired(r.userId);
  const attempts = await db.assessmentAttempt.findMany({ where: { userId: r.userId }, orderBy: { attemptNo: "asc" } });
  const rows: [string, string][] = [
    [t("field.fullName"), r.fullName], [t("field.nic"), r.nic], [t("field.dob"), fmtDate(r.dob, locale)], [t("field.gender"), genderLabel(r.gender, t)],
    [t("field.occupation"), r.occupation || "—"], [t("field.address"), r.address], [t("field.country"), countryName(r.country, locale) || "—"], [t("field.state"), r.district || "—"], [t("field.phone"), r.phone],
    [t("field.email"), r.email], [t("field.appliedOn"), fmtDate(r.createdAt, locale)], [t("field.cardNo"), r.cardNo || "—"],
    [t("field.reviewedBy"), r.reviewedBy ? `${r.reviewedBy} (${fmtDate(r.reviewedAt!, locale)})` : "—"],
  ];
  return (
    <>
      <Link href="/admin/registrations" className="text-sm text-navy-600 hover:underline">{t("areg.back")}</Link>
      <div className="mt-2"><PageTitle title={r.fullName} action={<StatusBadge status={r.status} />} /></div>
      <Flash searchParams={searchParams} />
      <div className="grid gap-6 xl:grid-cols-3">
        <div className="card p-6 xl:col-span-2">
          <div className="flex flex-col gap-6 sm:flex-row">
            <div className="h-40 w-32 shrink-0 overflow-hidden rounded-lg bg-slate-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {r.photo ? <img src={r.photo} alt="" className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-xs text-slate-400">{t("areg.noPhoto")}</div>}
            </div>
            <dl className="grid flex-1 gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
              {rows.map(([k, v]) => <div key={k}><dt className="text-slate-500">{k}</dt><dd className="font-medium text-slate-900">{v}</dd></div>)}
            </dl>
          </div>
          <div className="mt-6 border-t border-slate-100 pt-4 text-sm">
            <span className="text-slate-500">{t("areg.nicCopy")}</span>
            {r.document ? <a href={r.document} target="_blank" className="font-medium text-navy-600 hover:underline">{t("areg.open")}</a> : <span>{t("areg.notUploaded")}</span>}
          </div>
          {r.status === "APPROVED" && (
            <div className="mt-6 border-t border-slate-100 pt-4">
              <h2 className="text-sm font-bold text-slate-800">{t("areg.memberDocs")}</h2>
              {r.documents.length ? (
                <ul className="mt-2 divide-y divide-slate-100 text-sm">
                  {r.documents.map((d) => (
                    <li key={d.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
                      <span><span className="badge mr-2 bg-navy-50 text-navy-700">{t(`docs.kind.${d.kind}` as DictKey)}</span>{d.name}</span>
                      <span className="flex items-center gap-3 text-xs text-slate-400">{fmtDate(d.createdAt, locale)}<a href={d.file} target="_blank" className="font-medium text-navy-600 hover:underline">{t("areg.open")}</a></span>
                    </li>
                  ))}
                </ul>
              ) : <p className="mt-1 text-sm text-slate-500">{t("docs.empty")}</p>}
            </div>
          )}
          {r.status === "REJECTED" && r.rejectReason && <p className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">{t("areg.rejectReason", { reason: r.rejectReason })}</p>}
        </div>

        <div className="space-y-4">
          {r.status === "APPROVED" && (
            <form action={setRegistrationStage} className="card space-y-3 border-navy-200 p-5">
              <input type="hidden" name="id" value={r.id} />
              <h2 className="font-bold text-slate-800">{t("areg.progressTitle")}</h2>
              <div>
                <label className="label">{t("areg.progressStage")}</label>
                <select name="stage" defaultValue={r.stage} className="input">
                  {STAGES.map((k, i) => <option key={k} value={i + 1}>{i + 1}. {t(`journey.${k}.title`)}</option>)}
                </select>
              </div>
              <div>
                <label className="label">{t("areg.progressNote")}</label>
                <textarea name="note" rows={3} defaultValue={r.stageNote ?? ""} className="input" />
              </div>
              <button className="btn-primary w-full">{t("areg.progressSave")}</button>
            </form>
          )}
          {r.status === "APPROVED" && <FeesAdmin registrationId={r.id} userId={r.userId} />}
          {(r.status === "APPROVED" || attempts.length > 0) && (
            <div className="card p-5">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-slate-800">{t("aexam.panelTitle")}</h2>
                <span className="text-xs text-slate-500">{t("exam.used", { n: attempts.length, max: MAX_ATTEMPTS })}</span>
              </div>
              {attempts.length ? (
                <ul className="mt-3 divide-y divide-slate-100 text-sm">
                  {attempts.map((a) => (
                    <li key={a.id} className="flex items-center justify-between gap-2 py-2">
                      <span>
                        <span className="font-medium">#{a.attemptNo}</span>
                        <span className="ml-2 whitespace-nowrap text-xs text-slate-400" title={`${t("aexam.colPaper")} ${a.paper}`}>{a.startedAt.toISOString().slice(0, 10)}</span>
                      </span>
                      <span className="flex items-center gap-2">
                        {a.status === "IN_PROGRESS" ? <span className="badge bg-amber-100 text-amber-700">{t("exam.inProgress")}</span>
                          : <span className={`badge ${passed(a.score, a.total) ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>{a.score ?? 0}/{a.total}</span>}
                        <form action={deleteAssessmentAttempt}>
                          <input type="hidden" name="id" value={a.id} />
                          <input type="hidden" name="back" value={`/admin/registrations/${r.id}`} />
                          <ConfirmButton className="text-xs text-red-600 hover:underline" message={t("aexam.deleteConfirm")}>{t("common.delete")}</ConfirmButton>
                        </form>
                      </span>
                    </li>
                  ))}
                </ul>
              ) : <p className="mt-2 text-sm text-slate-500">{t("aexam.none")}</p>}
              <p className="mt-3 text-xs text-slate-400">{t("aexam.panelHint")}</p>
            </div>
          )}
          {r.status !== "APPROVED" && (
            <form action={approveRegistration} className="card p-5">
              <input type="hidden" name="id" value={r.id} />
              <h2 className="font-bold text-slate-800">{t("areg.approveTitle")}</h2>
              <p className="mt-1 text-sm text-slate-500">{t("areg.approveText")}</p>
              <button className="btn-success mt-3 w-full">{t("areg.approveBtn")}</button>
            </form>
          )}
          {r.status !== "REJECTED" && (
            <form action={rejectRegistration} className="card p-5">
              <input type="hidden" name="id" value={r.id} />
              <h2 className="font-bold text-slate-800">{t("areg.rejectTitle")}</h2>
              <textarea name="reason" rows={3} placeholder={t("areg.rejectPh")} className="input mt-2" required />
              <button className="btn-danger mt-3 w-full">{t("areg.rejectBtn")}</button>
            </form>
          )}
          {r.status !== "PENDING" && (
            <form action={resetRegistration} className="card p-5">
              <input type="hidden" name="id" value={r.id} />
              <button className="btn-outline w-full">{t("areg.resetBtn")}</button>
            </form>
          )}
          <form action={deleteRegistration} className="px-1">
            <input type="hidden" name="id" value={r.id} />
            <ConfirmButton className="text-sm text-red-600 hover:underline" message={t("areg.deleteConfirm")}>{t("areg.deleteBtn")}</ConfirmButton>
          </form>
        </div>
      </div>
    </>
  );
}

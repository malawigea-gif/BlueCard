import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { getSettings } from "@/lib/settings";
import { getT } from "@/lib/i18n/server";
import { fmtDate, genderLabel, statusLabel } from "@/lib/i18n/dict";
import { BlueCard } from "@/components/BlueCard";
import { countryName } from "@/lib/geo";
import { Journey } from "@/components/Journey";
import { MemberDocuments } from "@/components/MemberDocuments";
import { ChangePassword } from "@/components/ChangePassword";
import { Alert } from "@/components/Alert";
import Link from "next/link";
import { ASSESSMENT_STAGE, MAX_ATTEMPTS, passed } from "@/lib/assessment/config";
import { FEES } from "@/lib/payments/config";
import { feeDue, getJobFee } from "@/lib/payments/status";
import { FeeDueNotice, FeesPanel } from "@/components/payments/FeesPanel";

export async function generateMetadata() {
  const { t } = await getT();
  return { title: t("profile.title") };
}

export default async function Profile({ searchParams }: { searchParams: Promise<{ new?: string; payErr?: string }> }) {
  const s = await requireUser();
  if (s.role === "ADMIN") redirect("/admin");
  const { t, locale } = await getT();
  const [user, settings, sp] = await Promise.all([
    db.user.findUnique({ where: { id: s.uid }, include: { registration: { include: { documents: { orderBy: { createdAt: "desc" } } } }, assessments: { orderBy: { attemptNo: "asc" } } } }),
    getSettings(locale),
    searchParams,
  ]);
  if (!user) redirect("/login");
  const r = user.registration;
  const approved = r?.status === "APPROVED";
  const [jobDue, visaDue] = approved ? await Promise.all([feeDue(user.id, r.stage, "JOB_MATCHING"), feeDue(user.id, r.stage, "VISA")]) : [false, false];
  const jobEnded = jobDue ? (await getJobFee(user.id)).ended : null;
  const dueNotice = jobDue ? <FeeDueNotice kind="JOB_MATCHING" ended={jobEnded} /> : visaDue ? <FeeDueNotice kind="VISA" /> : null;
  const showFees = approved && (r.stage >= FEES.JOB_MATCHING.stage - 1 || (await db.payment.count({ where: { userId: user.id } })) > 0);
  const badge = r?.status === "APPROVED" ? "bg-emerald-100 text-emerald-700" : r?.status === "REJECTED" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700";

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      {sp.new && <div className="mb-6"><Alert ok={t("profile.submitted")} /></div>}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-bold text-navy-800">{t("profile.hello", { name: user.name })}</h1>
        {r && <span className={`badge ${badge} text-sm`}>{t("profile.status", { status: statusLabel(r.status, t) })}</span>}
      </div>

      {r ? (
        <div className="mt-8 grid gap-8 lg:grid-cols-5">
          <div className="space-y-4 lg:col-span-2">
            {r.status === "APPROVED" ? (
              <>
                <BlueCard r={{ ...r, district: [r.district, countryName(r.country, locale)].filter(Boolean).join(", ") }} siteName={settings.siteName} logo={settings.logo} passportLabel={t("areg.colNic")}
                  issuedLabel={r.reviewedAt ? t("card.issued", { date: r.reviewedAt.toISOString().slice(0, 10) }) : undefined} />
              </>
            ) : r.status === "REJECTED" ? (
              <div className="card border-red-200 p-6">
                <div className="font-bold text-red-700">{t("profile.rejected")}</div>
                <p className="mt-2 text-sm text-slate-700">{t("profile.reason", { reason: r.rejectReason || t("profile.noReason") })}</p>
                <p className="mt-2 text-sm text-slate-500">{t("profile.contactOffice")}</p>
              </div>
            ) : (
              <div className="card p-6 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-2xl">⏳</div>
                <div className="mt-3 font-bold text-slate-800">{t("profile.pending")}</div>
                <p className="mt-1 text-sm text-slate-500">{t("profile.submittedOn", { date: fmtDate(r.createdAt, locale) })}</p>
              </div>
            )}
          </div>
          <div className="card p-6 lg:col-span-3 print:hidden">
            <h2 className="text-lg font-bold text-navy-800">{t("profile.myDetails")}</h2>
            <dl className="mt-4 grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
              {[
                [t("field.fullName"), r.fullName],
                [t("field.nic"), r.nic],
                [t("field.dob"), fmtDate(r.dob, locale)],
                [t("field.gender"), genderLabel(r.gender, t)],
                [t("field.address"), r.address],
                [t("field.country"), countryName(r.country, locale) || "—"],
                [t("field.state"), r.district || "—"],
                [t("field.phone"), r.phone],
                [t("field.email"), r.email],
                [t("field.occupation"), r.occupation || "—"],
                [t("field.cardNo"), r.cardNo || "—"],
              ].map(([k, v]) => (
                <div key={k}><dt className="text-slate-500">{k}</dt><dd className="font-medium text-slate-900">{v}</dd></div>
              ))}
            </dl>
            <p className="mt-4 text-xs text-slate-400">{t("profile.changeDetails")}</p>
          </div>
        </div>
      ) : (
        <p className="mt-6 text-slate-600">{t("profile.noRegistration")}</p>
      )}

      {r?.status === "APPROVED" && (r.stage === ASSESSMENT_STAGE || user.assessments.length > 0) && (() => {
        const done = user.assessments.filter((a) => a.status !== "IN_PROGRESS");
        const last = done[done.length - 1];
        const open = user.assessments.some((a) => a.status === "IN_PROGRESS");
        return (
          <div className="card mt-8 flex flex-wrap items-center justify-between gap-4 border-gold-400/60 bg-gradient-to-r from-navy-50 to-white p-6 print:hidden">
            <div className="min-w-0">
              <h2 className="text-lg font-bold text-navy-800">{t("exam.title")}</h2>
              <p className="mt-1 text-sm text-slate-600">
                {last ? t("exam.lastResult", { score: last.score ?? 0, total: last.total, result: t(passed(last.score, last.total) ? "exam.passed" : "exam.notPassed") }) : t("exam.cardText")}
              </p>
              <p className="mt-1 text-xs text-slate-500">{t("exam.used", { n: user.assessments.length, max: MAX_ATTEMPTS })}</p>
            </div>
            <Link href="/profile/assessment" className="btn-gold">{t(open ? "exam.continue" : "exam.open")}</Link>
          </div>
        );
      })()}

      {r?.status === "APPROVED" && (
        <div className="mt-8 grid gap-8 lg:grid-cols-5">
          <div className="lg:col-span-3"><Journey stage={r.stage} note={r.stageNote} updatedAt={r.stageUpdatedAt} extra={dueNotice} /></div>
          <div className="lg:col-span-2">
            <MemberDocuments docs={r.documents.map((d) => ({ id: d.id, kind: d.kind, name: d.name, file: d.file, date: fmtDate(d.createdAt, locale) }))} />
          </div>
        </div>
      )}

      {showFees && r && <div className="mt-8"><FeesPanel userId={user.id} stage={r.stage} error={sp.payErr} /></div>}

      <div className="card mt-8 max-w-md p-6 print:hidden">
        <h2 className="mb-4 text-lg font-bold text-navy-800">{t("profile.changePassword")}</h2>
        <ChangePassword />
      </div>
    </div>
  );
}

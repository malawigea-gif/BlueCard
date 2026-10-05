import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { getT } from "@/lib/i18n/server";
import { fmtDate } from "@/lib/i18n/dict";
import { ASSESSMENT_STAGE, DURATION_MIN, MAX_ATTEMPTS, PASS_PERCENT, QUESTIONS_PER_PAPER, passed } from "@/lib/assessment/config";
import { closeExpired } from "@/lib/assessment/engine";
import { startAssessment } from "@/app/actions/assessment";
import { Alert } from "@/components/Alert";
import { ConfirmButton } from "@/components/admin/ConfirmButton";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const { t } = await getT();
  return { title: t("exam.title") };
}

export default async function AssessmentOverview({ searchParams }: { searchParams: Promise<{ err?: string }> }) {
  const s = await requireUser();
  if (s.role === "ADMIN") redirect("/admin/assessments");
  const { t, locale } = await getT();
  await closeExpired(s.uid);
  const [reg, attempts, sp] = await Promise.all([
    db.registration.findUnique({ where: { userId: s.uid } }),
    db.assessmentAttempt.findMany({ where: { userId: s.uid }, orderBy: { attemptNo: "asc" } }),
    searchParams,
  ]);
  const open = attempts.find((a) => a.status === "IN_PROGRESS");
  const left = Math.max(MAX_ATTEMPTS - attempts.length, 0);
  const stageOpen = reg?.status === "APPROVED" && reg.stage === ASSESSMENT_STAGE;
  const best = attempts.reduce<number | null>((m, a) => (a.score != null && (m == null || a.score > m) ? a.score : m), null);

  const rules = [
    t("exam.rule.questions", { n: QUESTIONS_PER_PAPER }),
    t("exam.rule.time", { min: DURATION_MIN }),
    t("exam.rule.once"),
    t("exam.rule.auto"),
    t("exam.rule.attempts", { max: MAX_ATTEMPTS }),
    t("exam.rule.pass", { p: PASS_PERCENT }),
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <Link href="/profile" className="text-sm text-navy-600 hover:underline">{t("exam.backProfile")}</Link>
      <h1 className="mt-2 text-3xl font-bold text-navy-800">{t("exam.title")}</h1>
      <p className="mt-2 max-w-2xl text-slate-600">{t("exam.intro")}</p>
      {sp.err && <div className="mt-6"><Alert error={sp.err} /></div>}

      <div className="mt-8 grid gap-8 lg:grid-cols-5">
        <section className="card p-6 lg:col-span-3">
          <h2 className="text-lg font-bold text-navy-800">{t("exam.rulesTitle")}</h2>
          <ul className="mt-4 space-y-3 text-sm text-slate-700">
            {rules.map((r) => (
              <li key={r} className="flex gap-3"><span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-gold-400" aria-hidden /><span className="leading-6">{r}</span></li>
            ))}
          </ul>
          <div className="mt-5 grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
            {(["EN", "GK", "MA", "DE"] as const).map((k) => (
              <div key={k} className="rounded-lg bg-navy-50 px-3 py-2 text-center font-medium text-navy-800">{t(`exam.section.${k}`)}</div>
            ))}
          </div>
        </section>

        <section className="card p-6 lg:col-span-2">
          <div className="flex items-end justify-between">
            <h2 className="text-lg font-bold text-navy-800">{t("exam.yourAttempts")}</h2>
            <span className="text-sm text-slate-500">{t("exam.used", { n: attempts.length, max: MAX_ATTEMPTS })}</span>
          </div>
          <div className="mt-3 flex gap-1.5" aria-hidden>
            {Array.from({ length: MAX_ATTEMPTS }, (_, i) => (
              <span key={i} className={`h-2 flex-1 rounded-full ${i < attempts.length ? "bg-navy-600" : "bg-slate-200"}`} />
            ))}
          </div>
          {best != null && <p className="mt-4 text-sm text-slate-600">{t("exam.best", { score: best, total: QUESTIONS_PER_PAPER })}</p>}

          <div className="mt-6">
            {open ? (
              <Link href={`/profile/assessment/${open.id}`} className="btn-gold w-full">{t("exam.continue")}</Link>
            ) : !stageOpen ? (
              <p className="rounded-lg bg-slate-50 p-4 text-sm text-slate-600">{t("exam.notOpen")}</p>
            ) : left === 0 ? (
              <p className="rounded-lg bg-slate-50 p-4 text-sm text-slate-600">{t("exam.noneLeft", { max: MAX_ATTEMPTS })}</p>
            ) : (
              <form action={startAssessment}>
                <ConfirmButton className="btn-gold w-full" message={t("exam.startConfirm", { min: DURATION_MIN })}>
                  {t(attempts.length ? "exam.startAgain" : "exam.start")}
                </ConfirmButton>
                <p className="mt-2 text-center text-xs text-slate-500">{t("exam.left", { n: left })}</p>
              </form>
            )}
          </div>
        </section>
      </div>

      {attempts.length > 0 && (
        <section className="card mt-8 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">{t("exam.col.no")}</th>
                <th className="px-4 py-3 font-medium">{t("exam.col.date")}</th>
                <th className="px-4 py-3 font-medium">{t("exam.col.score")}</th>
                <th className="px-4 py-3 font-medium">{t("exam.col.result")}</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {attempts.map((a) => (
                <tr key={a.id}>
                  <td className="px-4 py-3 font-medium text-slate-800">{a.attemptNo}</td>
                  <td className="px-4 py-3 text-slate-600">{fmtDate(a.startedAt, locale)}</td>
                  <td className="px-4 py-3 text-slate-800">{a.status === "IN_PROGRESS" ? "—" : `${a.score ?? 0} / ${a.total}`}</td>
                  <td className="px-4 py-3">
                    {a.status === "IN_PROGRESS" ? (
                      <span className="badge bg-amber-100 text-amber-700">{t("exam.inProgress")}</span>
                    ) : passed(a.score, a.total) ? (
                      <span className="badge bg-emerald-100 text-emerald-700">{t("exam.passed")}</span>
                    ) : (
                      <span className="badge bg-red-100 text-red-700">{t("exam.notPassed")}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right"><Link href={`/profile/assessment/${a.id}`} className="font-medium text-navy-600 hover:underline">{t(a.status === "IN_PROGRESS" ? "exam.continueShort" : "exam.view")}</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </div>
  );
}

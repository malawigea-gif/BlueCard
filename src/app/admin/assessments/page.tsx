import Link from "next/link";
import { db } from "@/lib/db";
import { getT } from "@/lib/i18n/server";
import { fmtDate } from "@/lib/i18n/dict";
import { DURATION_MIN, MAX_ATTEMPTS, PASS_PERCENT, QUESTIONS_PER_PAPER, passed } from "@/lib/assessment/config";
import { closeExpired } from "@/lib/assessment/engine";
import { PageTitle } from "@/components/admin/PageTitle";
import { Flash, type SP } from "@/components/admin/Flash";

export default async function AdminAssessments({ searchParams }: { searchParams: SP }) {
  const { t, locale } = await getT();
  const sp = await searchParams;
  const filter = sp.result === "passed" || sp.result === "failed" || sp.result === "open" ? sp.result : "";
  await closeExpired();
  const rows = await db.assessmentAttempt.findMany({
    where: filter === "open" ? { status: "IN_PROGRESS" } : filter ? { status: { not: "IN_PROGRESS" } } : {},
    orderBy: { startedAt: "desc" },
    take: 300,
    include: { user: { include: { registration: { select: { id: true, fullName: true, cardNo: true } } } } },
  });
  const list = filter === "passed" ? rows.filter((a) => passed(a.score, a.total)) : filter === "failed" ? rows.filter((a) => !passed(a.score, a.total)) : rows;
  const tabs: [string, string][] = [["", t("common.all")], ["passed", t("exam.passed")], ["failed", t("exam.notPassed")], ["open", t("exam.inProgress")]];

  return (
    <>
      <PageTitle title={t("aexam.title")} sub={t("aexam.sub", { n: QUESTIONS_PER_PAPER, min: DURATION_MIN, max: MAX_ATTEMPTS, p: PASS_PERCENT })} />
      <Flash searchParams={searchParams} />
      <div className="mb-4 flex flex-wrap gap-2">
        {tabs.map(([k, label]) => (
          <Link key={k} href={k ? `/admin/assessments?result=${k}` : "/admin/assessments"}
            className={`rounded-full px-3 py-1 text-sm font-medium ${filter === k ? "bg-navy-700 text-white" : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"}`}>{label}</Link>
        ))}
      </div>
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">{t("aexam.colMember")}</th>
              <th className="px-4 py-3 font-medium">{t("exam.col.no")}</th>
              <th className="px-4 py-3 font-medium">{t("aexam.colPaper")}</th>
              <th className="px-4 py-3 font-medium">{t("exam.col.date")}</th>
              <th className="px-4 py-3 font-medium">{t("exam.col.score")}</th>
              <th className="px-4 py-3 font-medium">{t("exam.col.result")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {list.map((a) => {
              const reg = a.user.registration;
              return (
                <tr key={a.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    {reg ? <Link href={`/admin/registrations/${reg.id}`} className="font-medium text-navy-700 hover:underline">{reg.fullName}</Link> : <span className="font-medium">{a.user.name}</span>}
                    <div className="text-xs text-slate-400">{reg?.cardNo || a.user.email}</div>
                  </td>
                  <td className="px-4 py-3">{a.attemptNo} / {MAX_ATTEMPTS}</td>
                  <td className="px-4 py-3">{a.paper}</td>
                  <td className="px-4 py-3 text-slate-600">{fmtDate(a.startedAt, locale)} {a.startedAt.toTimeString().slice(0, 5)}</td>
                  <td className="px-4 py-3 font-medium">{a.status === "IN_PROGRESS" ? "—" : `${a.score ?? 0} / ${a.total}`}</td>
                  <td className="px-4 py-3">
                    {a.status === "IN_PROGRESS" ? <span className="badge bg-amber-100 text-amber-700">{t("exam.inProgress")}</span>
                      : passed(a.score, a.total) ? <span className="badge bg-emerald-100 text-emerald-700">{t("exam.passed")}</span>
                      : <span className="badge bg-red-100 text-red-700">{t("exam.notPassed")}</span>}
                    {a.status === "EXPIRED" && <span className="ml-2 text-xs text-slate-400">{t("aexam.timedOut")}</span>}
                  </td>
                </tr>
              );
            })}
            {!list.length && <tr><td colSpan={6} className="px-4 py-10 text-center text-slate-500">{t("aexam.empty")}</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}

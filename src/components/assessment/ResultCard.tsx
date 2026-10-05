import { getT } from "@/lib/i18n/server";
import type { DictKey } from "@/lib/i18n/dict";
import { PASS_PERCENT, SECTIONS, passed } from "@/lib/assessment/config";
import { parseSections } from "@/lib/assessment/engine";

type Attempt = { attemptNo: number; status: string; score: number | null; total: number; sections: string | null };

/** Score of a finished attempt with a bar per section. */
export async function ResultCard({ a }: { a: Attempt }) {
  const { t } = await getT();
  const ok = passed(a.score, a.total);
  const pct = a.total ? Math.round(((a.score ?? 0) / a.total) * 100) : 0;
  const secs = parseSections(a.sections);
  return (
    <section className="card p-6 md:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="text-sm text-slate-500">{t("exam.attemptN", { n: a.attemptNo })} · {t(a.status === "EXPIRED" ? "exam.closedByTime" : "exam.submitted")}</div>
          <div className="mt-1 text-4xl font-bold text-navy-900">{a.score ?? 0}<span className="text-xl text-slate-400"> / {a.total}</span></div>
          <div className="mt-1 text-sm text-slate-600">{pct}% · {t("exam.passMark", { p: PASS_PERCENT })}</div>
        </div>
        <span className={`badge text-sm ${ok ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>{t(ok ? "exam.passed" : "exam.notPassed")}</span>
      </div>
      {secs && (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {SECTIONS.map((s) => {
            const v = secs[s];
            if (!v) return null;
            return (
              <div key={s}>
                <div className="flex justify-between text-sm"><span className="font-medium text-slate-700">{t(`exam.section.${s}` as DictKey)}</span><span className="text-slate-500">{v.correct} / {v.total}</span></div>
                <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-navy-600" style={{ width: `${v.total ? (v.correct / v.total) * 100 : 0}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

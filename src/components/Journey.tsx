import { getT } from "@/lib/i18n/server";
import { fmtDate } from "@/lib/i18n/dict";
import { STAGES } from "@/lib/journey";

/** Timeline of the member's steps on the way to Germany, with the current step expanded. */
export async function Journey({ stage, note, updatedAt, extra }: { stage: number; note: string | null; updatedAt: Date | null; extra?: React.ReactNode }) {
  const { t, locale } = await getT();
  const current = Math.min(Math.max(stage, 1), STAGES.length);
  return (
    <section className="card p-6 md:p-8 print:hidden">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="text-xl font-bold text-navy-800">{t("journey.title")}</h2>
          <p className="mt-1 text-sm text-slate-500">{t("journey.sub", { n: current, total: STAGES.length })}</p>
        </div>
        {updatedAt && <span className="text-xs text-slate-400">{t("journey.updated", { date: fmtDate(updatedAt, locale) })}</span>}
      </div>

      {/* progress bar */}
      <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full bg-gradient-to-r from-navy-600 to-gold-400" style={{ width: `${(current / STAGES.length) * 100}%` }} />
      </div>

      <ol className="mt-6">
        {STAGES.map((k, i) => {
          const n = i + 1;
          const state = n < current ? "done" : n === current ? "current" : "next";
          const last = n === STAGES.length;
          return (
            <li key={k} className="relative flex gap-4 pb-6 last:pb-0">
              {!last && <span className={`absolute left-[15px] top-8 h-[calc(100%-2rem)] w-0.5 ${n < current ? "bg-navy-600" : "bg-slate-200"}`} aria-hidden />}
              <span className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                state === "done" ? "bg-navy-600 text-white" : state === "current" ? "bg-gold-400 text-navy-900 ring-4 ring-gold-400/25" : "border-2 border-slate-200 bg-white text-slate-400"
              }`}>
                {state === "done" ? "✓" : n}
              </span>
              <div className="min-w-0 flex-1 pt-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className={`font-bold ${state === "next" ? "text-slate-400" : "text-navy-900"}`}>{t(`journey.${k}.title`)}</h3>
                  {state === "current" && <span className="badge bg-gold-400/20 text-gold-500">{t("journey.current")}</span>}
                  {state === "done" && <span className="text-xs font-medium text-emerald-600">{t("journey.done")}</span>}
                </div>
                {state !== "next" && <p className="mt-1 text-sm leading-6 text-slate-600">{t(`journey.${k}.desc`)}</p>}
                {state === "current" && (
                  <div className="mt-3 space-y-3">
                    {extra}
                    <div className="rounded-lg border border-navy-100 bg-navy-50 p-4 text-sm">
                      <div className="font-semibold text-navy-800">{t("journey.yourTask")}</div>
                      <p className="mt-1 leading-6 text-slate-700">{t(`journey.${k}.todo`)}</p>
                    </div>
                    {note && (
                      <div className="rounded-lg border-l-4 border-gold-400 bg-amber-50 p-4 text-sm">
                        <div className="font-semibold text-slate-800">{t("journey.officeNote")}</div>
                        <p className="mt-1 whitespace-pre-line leading-6 text-slate-700">{note}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

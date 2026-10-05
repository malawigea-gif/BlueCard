"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useT } from "@/lib/i18n/client";
import type { DictKey } from "@/lib/i18n/dict";
import { answerQuestion, finishAssessment } from "@/app/actions/assessment";
import { SECTIONS } from "@/lib/assessment/config";
import type { ExamQuestion } from "@/lib/assessment/engine";

type Props = {
  attemptId: number;
  attemptNo: number;
  questions: ExamQuestion[];
  answered: Record<number, number>;
  expiresAt: number;
  serverNow: number;
};

function clock(ms: number) {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function AssessmentExam({ attemptId, attemptNo, questions, answered, expiresAt, serverNow }: Props) {
  const t = useT();
  const router = useRouter();
  // difference between the server clock and this computer's clock, so a wrong PC clock can't add time
  const offset = useRef(serverNow - Date.now());
  const [answers, setAnswers] = useState<Record<number, number>>(answered);
  const [idx, setIdx] = useState(() => Math.max(0, questions.findIndex((q) => answered[q.no] === undefined)));
  const [selected, setSelected] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [closing, setClosing] = useState(false);
  const [left, setLeft] = useState(() => expiresAt - serverNow);

  const total = questions.length;
  const doneCount = Object.keys(answers).length;
  const q = questions[idx];
  const locked = answers[q.no] !== undefined;

  const close = useCallback(async () => {
    setClosing(true);
    try { await finishAssessment(attemptId); } finally { router.refresh(); }
  }, [attemptId, router]);

  useEffect(() => {
    const tick = () => {
      const ms = expiresAt - (Date.now() + offset.current);
      setLeft(ms);
      if (ms <= 0) { clearInterval(timer); void close(); }
    };
    const timer = setInterval(tick, 1000);
    tick();
    return () => clearInterval(timer);
  }, [expiresAt, close]);

  function go(i: number) {
    setIdx((i + total) % total);
    setSelected(null);
    setMsg(null);
  }

  function nextOpen(from: number, current: Record<number, number>) {
    for (let k = 1; k <= total; k++) {
      const i = (from + k) % total;
      if (current[questions[i].no] === undefined) return i;
    }
    return from;
  }

  async function submit() {
    if (selected === null || locked || busy || closing) return;
    setBusy(true);
    setMsg(null);
    try {
      const r = await answerQuestion(attemptId, q.no, selected);
      if ("error" in r) {
        setMsg(r.error);
        if (r.closed) { setClosing(true); router.refresh(); }
        return;
      }
      const next = { ...answers, [q.no]: selected };
      setAnswers(next);
      setSelected(null);
      if (r.done) { setClosing(true); router.refresh(); return; }
      setIdx(nextOpen(idx, next));
    } catch {
      setMsg(t("exam.err.network"));
    } finally {
      setBusy(false);
    }
  }

  async function finish() {
    const open = total - doneCount;
    if (!confirm(open > 0 ? t("exam.finishConfirm", { n: open }) : t("exam.finishConfirmAll"))) return;
    await close();
  }

  const low = left <= 5 * 60_000;
  const sectionStart = questions.findIndex((x) => x.section === q.section);
  const sectionCount = questions.filter((x) => x.section === q.section).length;

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 select-none">
      {/* top bar */}
      <div className="sticky top-0 z-20 -mx-4 mb-6 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="font-bold text-navy-900">{t("exam.title")}</div>
            <div className="text-xs text-slate-500">{t("exam.attemptN", { n: attemptNo })} · {t("exam.answeredCount", { n: doneCount, total })}</div>
          </div>
          <div className={`flex items-center gap-2 rounded-full px-4 py-1.5 font-mono text-lg font-bold tabular-nums ${low ? "bg-red-100 text-red-700" : "bg-navy-50 text-navy-800"}`} role="timer" aria-live="off">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden><circle cx="12" cy="13" r="8" /><path d="M12 9v4l2 2M9 2h6" /></svg>
            <span><span className="sr-only">{t("exam.timeLeft")} </span>{clock(left)}</span>
          </div>
        </div>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100">
          <div className="h-full rounded-full bg-navy-600 transition-all" style={{ width: `${(doneCount / total) * 100}%` }} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        {/* question */}
        <section className="card p-6 md:p-8">
          <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
            <span className="badge bg-navy-50 text-navy-700">{t(`exam.section.${q.section}` as DictKey)} · {idx - sectionStart + 1}/{sectionCount}</span>
            <span className="text-slate-500">{t("exam.questionOf", { n: idx + 1, total })}</span>
          </div>
          <h2 className="mt-5 text-lg font-semibold leading-8 text-slate-900 md:text-xl">{q.text}</h2>

          <div className="mt-6 space-y-3" role="radiogroup">
            {q.options.map((o, i) => {
              const chosen = locked ? answers[q.no] === o.v : selected === o.v;
              return (
                <button
                  key={o.v}
                  type="button"
                  role="radio"
                  aria-checked={chosen}
                  disabled={locked || busy || closing}
                  onClick={() => setSelected(o.v)}
                  className={`flex w-full items-center gap-4 rounded-xl border-2 px-4 py-3 text-left transition ${
                    chosen ? (locked ? "border-slate-400 bg-slate-100" : "border-navy-600 bg-navy-50") : "border-slate-200 bg-white hover:border-navy-200"
                  } ${locked ? "cursor-not-allowed" : ""}`}
                >
                  <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${chosen ? (locked ? "bg-slate-500 text-white" : "bg-navy-600 text-white") : "bg-slate-100 text-slate-600"}`}>
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span className={locked && !chosen ? "text-slate-400" : "text-slate-800"}>{o.text}</span>
                </button>
              );
            })}
          </div>

          {locked ? (
            <p className="mt-5 rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-600">🔒 {t("exam.locked")}</p>
          ) : (
            <p className="mt-5 text-xs text-slate-500">{t("exam.warnOnce")}</p>
          )}
          {msg && <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{msg}</p>}

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-5">
            <button type="button" className="btn-outline" onClick={() => go(idx - 1)} disabled={busy || closing}>← {t("exam.prev")}</button>
            <div className="flex gap-3">
              {!locked && (
                <button type="button" className="btn-primary" onClick={submit} disabled={selected === null || busy || closing}>
                  {busy ? t("exam.saving") : t("exam.submitAnswer")}
                </button>
              )}
              <button type="button" className="btn-outline" onClick={() => go(idx + 1)} disabled={busy || closing}>{t(locked ? "exam.next" : "exam.skip")} →</button>
            </div>
          </div>
        </section>

        {/* navigator */}
        <aside className="card h-fit p-5 lg:sticky lg:top-28">
          <h3 className="font-bold text-slate-800">{t("exam.navTitle")}</h3>
          <div className="mt-3 space-y-4">
            {SECTIONS.map((sec) => (
              <div key={sec}>
                <div className="mb-1.5 text-xs font-medium text-slate-500">{t(`exam.section.${sec}` as DictKey)}</div>
                <div className="grid grid-cols-5 gap-1.5">
                  {questions.map((x, i) => x.section !== sec ? null : (
                    <button
                      key={x.no}
                      type="button"
                      onClick={() => go(i)}
                      disabled={busy || closing}
                      aria-label={t("exam.questionOf", { n: i + 1, total })}
                      className={`h-8 rounded-md text-xs font-semibold transition ${
                        i === idx ? "ring-2 ring-gold-400 ring-offset-1" : ""
                      } ${answers[x.no] !== undefined ? "bg-navy-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-navy-600" />{t("exam.legendDone")}</span>
            <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-slate-200" />{t("exam.legendOpen")}</span>
          </div>
          <button type="button" className="btn-danger mt-5 w-full" onClick={finish} disabled={busy || closing}>{t("exam.finish")}</button>
        </aside>
      </div>

      {closing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-900/70 p-4">
          <div className="card max-w-sm p-6 text-center">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-navy-100 border-t-navy-600" />
            <div className="mt-4 font-bold text-navy-900">{t(left <= 0 ? "exam.timeUp" : "exam.closing")}</div>
            <p className="mt-1 text-sm text-slate-600">{t("exam.closingText")}</p>
          </div>
        </div>
      )}
    </div>
  );
}

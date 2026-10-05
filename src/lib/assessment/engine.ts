import "server-only";
import { db } from "@/lib/db";
import { SECTIONS, type Section } from "./config";
import { getPaper, PAPERS } from "./papers";

/** Small deterministic random generator, so an attempt always shows the same order. */
function rng(seed: number) {
  let s = seed >>> 0 || 1;
  return () => {
    s ^= s << 13; s >>>= 0;
    s ^= s >>> 17;
    s ^= s << 5; s >>>= 0;
    return s / 4294967296;
  };
}

function shuffle<T>(arr: T[], rand: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export type ExamQuestion = { no: number; section: Section; text: string; options: { v: number; text: string }[] };

/**
 * The questions of an attempt as the applicant sees them — without the correct answers.
 * Sections stay in order (English, general knowledge, maths & IQ, Germany); questions within a
 * section and the options of every question are shuffled per attempt.
 * `no` is the question's number in the paper (1–40) and `v` the option's original index.
 */
export function examQuestions(paper: number, attemptId: number): ExamQuestion[] {
  const rand = rng(attemptId * 7919 + paper * 104729);
  const items = getPaper(paper).map((x, i) => ({ ...x, no: i + 1 }));
  return SECTIONS.flatMap((sec) =>
    shuffle(items.filter((x) => x.s === sec), rand).map((x) => ({
      no: x.no,
      section: x.s,
      text: x.q,
      options: shuffle(x.o.map((text, v) => ({ v, text })), rand),
    })),
  );
}

export function isCorrect(paper: number, questionNo: number, choice: number) {
  const item = getPaper(paper)[questionNo - 1];
  return !!item && item.a === choice;
}

export function paperCount() {
  return PAPERS.length;
}

export type SectionScores = Record<Section, { correct: number; total: number }>;

export function parseSections(json: string | null | undefined): SectionScores | null {
  if (!json) return null;
  try { return JSON.parse(json) as SectionScores; } catch { return null; }
}

/** Marks an attempt and closes it. Does nothing if it is already closed. */
export async function finalizeAttempt(attemptId: number, reason: "SUBMITTED" | "EXPIRED") {
  const attempt = await db.assessmentAttempt.findUnique({ where: { id: attemptId }, include: { answers: true } });
  if (!attempt || attempt.status !== "IN_PROGRESS") return attempt;
  const paper = getPaper(attempt.paper);
  const sections = Object.fromEntries(SECTIONS.map((s) => [s, { correct: 0, total: paper.filter((x) => x.s === s).length }])) as SectionScores;
  let score = 0;
  for (const a of attempt.answers) {
    if (!a.correct) continue;
    score++;
    const sec = paper[a.questionNo - 1]?.s;
    if (sec) sections[sec].correct++;
  }
  const status = reason === "SUBMITTED" && attempt.expiresAt.getTime() < Date.now() ? "EXPIRED" : reason;
  // updateMany + status check: a second request closing the same attempt changes nothing
  await db.assessmentAttempt.updateMany({
    where: { id: attemptId, status: "IN_PROGRESS" },
    data: { status, finishedAt: new Date(), score, total: paper.length, sections: JSON.stringify(sections) },
  });
  return db.assessmentAttempt.findUnique({ where: { id: attemptId } });
}

/** Closes every attempt whose 50 minutes are over (for one member, or for everyone). */
export async function closeExpired(userId?: number) {
  const open = await db.assessmentAttempt.findMany({
    where: { status: "IN_PROGRESS", expiresAt: { lt: new Date() }, ...(userId ? { userId } : {}) },
    select: { id: true },
  });
  for (const a of open) await finalizeAttempt(a.id, "EXPIRED");
}

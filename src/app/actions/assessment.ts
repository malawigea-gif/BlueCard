"use server";
import { randomInt } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getSession, requireAdmin } from "@/lib/auth";
import { getT } from "@/lib/i18n/server";
import { audit } from "@/lib/audit";
import { str } from "@/lib/utils";
import { ASSESSMENT_STAGE, DURATION_MIN, MAX_ATTEMPTS } from "@/lib/assessment/config";
import { closeExpired, finalizeAttempt, isCorrect, paperCount } from "@/lib/assessment/engine";

const GRACE_MS = 5_000; // allowance for network delay on the last answer

function backToOverview(err: string): never {
  redirect(`/profile/assessment?err=${encodeURIComponent(err)}`);
}

/** Starts a new attempt with a random paper the member has not had yet (or resumes the open one). */
export async function startAssessment() {
  const s = await getSession();
  if (!s) redirect("/login?next=/profile/assessment");
  const { t } = await getT();
  const reg = await db.registration.findUnique({ where: { userId: s.uid } });
  if (!reg || reg.status !== "APPROVED" || reg.stage !== ASSESSMENT_STAGE) backToOverview(t("exam.err.notOpen"));

  await closeExpired(s.uid);
  const attempts = await db.assessmentAttempt.findMany({ where: { userId: s.uid }, orderBy: { attemptNo: "asc" } });
  const open = attempts.find((a) => a.status === "IN_PROGRESS");
  if (open) redirect(`/profile/assessment/${open.id}`);
  if (attempts.length >= MAX_ATTEMPTS) backToOverview(t("exam.err.noAttempts", { max: MAX_ATTEMPTS }));

  const used = new Set(attempts.map((a) => a.paper));
  const all = Array.from({ length: paperCount() }, (_, i) => i + 1);
  const fresh = all.filter((p) => !used.has(p));
  const pool = fresh.length ? fresh : all;
  const paper = pool[randomInt(pool.length)];

  const now = new Date();
  let id: number;
  try {
    const a = await db.assessmentAttempt.create({
      data: { userId: s.uid, attemptNo: attempts.length + 1, paper, startedAt: now, expiresAt: new Date(now.getTime() + DURATION_MIN * 60_000) },
    });
    id = a.id;
  } catch {
    // the same member pressed "Start" twice at once — the unique attempt number stopped the second one
    const again = await db.assessmentAttempt.findFirst({ where: { userId: s.uid, status: "IN_PROGRESS" } });
    if (!again) backToOverview(t("exam.err.generic"));
    id = again.id;
  }
  await audit(reg.email, "assessment.start", `attempt ${attempts.length + 1}, paper ${paper}`);
  redirect(`/profile/assessment/${id}`);
}

export type AnswerResult = { ok: true; done: boolean } | { error: string; closed?: boolean };

/** Saves the answer to one question. A question can be answered only once. */
export async function answerQuestion(attemptId: number, questionNo: number, choice: number): Promise<AnswerResult> {
  const { t } = await getT();
  const s = await getSession();
  if (!s) return { error: t("exam.err.session"), closed: true };
  const attempt = await db.assessmentAttempt.findUnique({ where: { id: Number(attemptId) }, include: { _count: { select: { answers: true } } } });
  if (!attempt || attempt.userId !== s.uid) return { error: t("exam.err.generic"), closed: true };
  if (attempt.status !== "IN_PROGRESS") return { error: t("exam.err.closed"), closed: true };
  if (Date.now() > attempt.expiresAt.getTime() + GRACE_MS) {
    await finalizeAttempt(attempt.id, "EXPIRED");
    return { error: t("exam.err.timeUp"), closed: true };
  }
  const no = Math.trunc(Number(questionNo));
  const ch = Math.trunc(Number(choice));
  if (!(no >= 1 && no <= attempt.total) || !(ch >= 0 && ch <= 3)) return { error: t("exam.err.generic") };

  try {
    await db.assessmentAnswer.create({ data: { attemptId: attempt.id, questionNo: no, choice: ch, correct: isCorrect(attempt.paper, no, ch) } });
  } catch {
    return { error: t("exam.err.alreadyAnswered") };
  }
  const done = attempt._count.answers + 1 >= attempt.total;
  if (done) await finalizeAttempt(attempt.id, "SUBMITTED");
  return { ok: true, done };
}

/** "Finish test" button, and the automatic close when the 50 minutes are over. */
export async function finishAssessment(attemptId: number) {
  const s = await getSession();
  if (!s) return;
  const attempt = await db.assessmentAttempt.findUnique({ where: { id: Number(attemptId) } });
  if (!attempt || attempt.userId !== s.uid || attempt.status !== "IN_PROGRESS") return;
  await finalizeAttempt(attempt.id, attempt.expiresAt.getTime() <= Date.now() ? "EXPIRED" : "SUBMITTED");
  revalidatePath("/profile/assessment");
}

/** Admin: removes one attempt so that the member gets that chance back. */
export async function deleteAssessmentAttempt(fd: FormData) {
  const s = await requireAdmin();
  const { t } = await getT();
  const id = Number(str(fd, "id"));
  const want = str(fd, "back");
  const back = want.startsWith("/admin/") ? want : "/admin/assessments";
  const a = await db.assessmentAttempt.findUnique({ where: { id }, include: { user: true } });
  if (a) {
    await db.assessmentAttempt.delete({ where: { id } });
    // keep attempt numbers 1, 2, 3 … without gaps so the next attempt gets a free number
    const rest = await db.assessmentAttempt.findMany({ where: { userId: a.userId }, orderBy: { attemptNo: "asc" } });
    for (const [i, r] of rest.entries()) {
      if (r.attemptNo !== i + 1) await db.assessmentAttempt.update({ where: { id: r.id }, data: { attemptNo: -(i + 1) } });
    }
    for (const r of await db.assessmentAttempt.findMany({ where: { userId: a.userId, attemptNo: { lt: 0 } } })) {
      await db.assessmentAttempt.update({ where: { id: r.id }, data: { attemptNo: -r.attemptNo } });
    }
    await audit(s.name, "assessment.delete", `${a.user.email}: attempt ${a.attemptNo}`);
  }
  redirect(`${back}${back.includes("?") ? "&" : "?"}msg=${encodeURIComponent(t("aexam.deleted"))}`);
}

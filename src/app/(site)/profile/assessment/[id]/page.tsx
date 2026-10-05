import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { getT } from "@/lib/i18n/server";
import { examQuestions, finalizeAttempt } from "@/lib/assessment/engine";
import { AssessmentExam } from "@/components/assessment/AssessmentExam";
import { ResultCard } from "@/components/assessment/ResultCard";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const { t } = await getT();
  return { title: t("exam.title") };
}

export default async function AttemptPage({ params }: { params: Promise<{ id: string }> }) {
  const s = await requireUser();
  if (s.role === "ADMIN") redirect("/admin/assessments");
  const { t } = await getT();
  let attempt = await db.assessmentAttempt.findUnique({ where: { id: Number((await params).id) }, include: { answers: true } });
  if (!attempt || attempt.userId !== s.uid) notFound();

  if (attempt.status === "IN_PROGRESS" && attempt.expiresAt.getTime() <= Date.now()) {
    await finalizeAttempt(attempt.id, "EXPIRED");
    attempt = await db.assessmentAttempt.findUnique({ where: { id: attempt.id }, include: { answers: true } });
    if (!attempt) notFound();
  }

  if (attempt.status !== "IN_PROGRESS") {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <Link href="/profile/assessment" className="text-sm text-navy-600 hover:underline">{t("exam.backOverview")}</Link>
        <h1 className="mb-6 mt-2 text-3xl font-bold text-navy-800">{t("exam.resultTitle")}</h1>
        <ResultCard a={attempt} />
        <p className="mt-4 text-sm text-slate-500">{t("exam.resultNote")}</p>
      </div>
    );
  }

  const answered = Object.fromEntries(attempt.answers.map((a) => [a.questionNo, a.choice]));
  return (
    <AssessmentExam
      attemptId={attempt.id}
      attemptNo={attempt.attemptNo}
      questions={examQuestions(attempt.paper, attempt.id)}
      answered={answered}
      expiresAt={attempt.expiresAt.getTime()}
      serverNow={Date.now()}
    />
  );
}

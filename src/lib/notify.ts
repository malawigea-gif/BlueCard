// Notifications to applicants. Email goes out through Resend when RESEND_API_KEY is set (see src/lib/mail.ts);
// SMS is not connected yet. Everything is also written to the server log.
import "server-only";
import { sendMail } from "@/lib/mail";
import { simpleEmail, stageEmail } from "@/lib/emails";

type To = { email?: string | null; phone?: string | null; name?: string | null };

export async function notify(to: To, subject: string, message: string) {
  console.log(`[notify] to=${to.email ?? ""} ${to.phone ?? ""} | ${subject}`);
  if (!to.email) return;
  await sendMail({ to: to.email, ...(await simpleEmail({ name: to.name || "Applicant", subject, message })) });
}

/** Congratulation letter for reaching a step on the path to Germany. */
export async function notifyStage(to: To, stage: number, extra: { cardNo?: string | null; note?: string | null } = {}) {
  console.log(`[notify] to=${to.email ?? ""} | stage ${stage}`);
  if (!to.email) return;
  await sendMail({ to: to.email, ...(await stageEmail({ stage, name: to.name || "Applicant", ...extra })) });
}

"use server";
import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getSession, requireAdmin } from "@/lib/auth";
import { getT } from "@/lib/i18n/server";
import { audit } from "@/lib/audit";
import { str } from "@/lib/utils";
import { tidyLine } from "@/lib/text";
import { FEES, isFeeKind } from "@/lib/payments/config";
import { payhereReady } from "@/lib/payments/payhere";
import { feeDue, getJobFee, markPaid } from "@/lib/payments/status";

function toProfile(err: string): never {
  redirect(`/profile?payErr=${encodeURIComponent(err)}#fees`);
}
function toRegistration(id: number, msg: string, kind: "msg" | "err" = "msg"): never {
  redirect(`/admin/registrations/${id}?${kind}=${encodeURIComponent(msg)}`);
}
function newOrderId(kind: string) {
  return `BC${kind === "VISA" ? "V" : "J"}-${Date.now().toString(36).toUpperCase()}-${randomBytes(3).toString("hex").toUpperCase()}`;
}

/* ---------- member ---------- */

/** Creates a payment for the fee that is due and sends the member to PayHere. */
export async function startPayment(fd: FormData) {
  const s = await getSession();
  if (!s) redirect("/login?next=/profile");
  const { t } = await getT();
  const kind = str(fd, "kind");
  if (!isFeeKind(kind)) toProfile(t("pay.err.generic"));
  const reg = await db.registration.findUnique({ where: { userId: s.uid } });
  if (!reg || reg.status !== "APPROVED") toProfile(t("pay.err.notDue"));
  if (!(await feeDue(s.uid, reg.stage, kind))) toProfile(t("pay.err.notDue"));
  if (!payhereReady()) toProfile(t("pay.err.notConfigured"));

  const fee = FEES[kind];
  const p = await db.payment.create({ data: { userId: s.uid, kind, orderId: newOrderId(kind), amountCents: fee.cents, currency: fee.currency } });
  await audit(reg.email, "payment.start", `${p.orderId} ${kind}`);
  redirect(`/profile/pay/${p.orderId}/checkout`);
}

/* ---------- admin ---------- */

/** Records a fee paid in cash or by bank transfer. */
export async function recordManualPayment(fd: FormData) {
  const s = await requireAdmin();
  const { t } = await getT();
  const id = Number(str(fd, "id"));
  const kind = str(fd, "kind");
  const reference = tidyLine(str(fd, "reference")).slice(0, 120);
  const reg = await db.registration.findUnique({ where: { id } });
  if (!reg) redirect("/admin/registrations");
  if (!isFeeKind(kind)) toRegistration(id, t("pay.err.generic"), "err");
  if (!reference) toRegistration(id, t("apay.err.reference"), "err");
  const fee = FEES[kind];
  const p = await db.payment.create({ data: { userId: reg.userId, kind, orderId: newOrderId(kind), amountCents: fee.cents, currency: fee.currency, method: "MANUAL" } });
  await markPaid(p.id, { method: "MANUAL", reference, recordedBy: s.name });
  toRegistration(id, t("apay.recorded", { item: t(`pay.kind.${kind}`) }));
}

/** Adds an interview; it is counted against the member's valid job matching fee. */
export async function addInterview(fd: FormData) {
  const s = await requireAdmin();
  const { t } = await getT();
  const id = Number(str(fd, "id"));
  const reg = await db.registration.findUnique({ where: { id } });
  if (!reg) redirect("/admin/registrations");
  const employer = tidyLine(str(fd, "employer")).slice(0, 160);
  const date = new Date(str(fd, "date"));
  const note = tidyLine(str(fd, "note")).slice(0, 300) || null;
  if (!employer || Number.isNaN(date.getTime())) toRegistration(id, t("apay.err.interview"), "err");
  const fee = await getJobFee(reg.userId);
  if (!fee.active) toRegistration(id, t("apay.err.noJobFee"), "err");
  await db.interview.create({ data: { userId: reg.userId, paymentId: fee.active.id, employer, date, note, createdBy: s.name } });
  await audit(s.name, "interview.add", `${reg.nic}: ${employer}`);
  revalidatePath("/profile");
  toRegistration(id, t("apay.interviewAdded", { n: fee.active.used + 1, max: fee.active.used + fee.active.left }));
}

export async function deleteInterview(fd: FormData) {
  const s = await requireAdmin();
  const { t } = await getT();
  const id = Number(str(fd, "id"));
  const iv = await db.interview.findUnique({ where: { id: Number(str(fd, "interview")) }, include: { user: { include: { registration: true } } } });
  if (iv) {
    await db.interview.delete({ where: { id: iv.id } });
    await audit(s.name, "interview.delete", `${iv.user.email}: ${iv.employer}`);
  }
  toRegistration(id, t("apay.interviewDeleted"));
}

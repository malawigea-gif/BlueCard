import "server-only";
import { db } from "@/lib/db";
import { notify } from "@/lib/notify";
import { audit } from "@/lib/audit";
import { makeT, DEFAULT_LOCALE } from "@/lib/i18n/dict";
import { FEES, JOB_FEE_INTERVIEWS, JOB_FEE_VALID_DAYS, amountString, fmtMoney, type FeeKind } from "./config";

export type JobFeeState = {
  /** the fee that currently covers new interviews, if any */
  active: { id: number; paidAt: Date; validUntil: Date; used: number; left: number } | null;
  /** why the last paid fee no longer counts */
  ended: "time" | "interviews" | null;
  everPaid: boolean;
};

export async function getJobFee(userId: number, now = new Date()): Promise<JobFeeState> {
  const paid = await db.payment.findMany({
    where: { userId, kind: "JOB_MATCHING", status: "PAID" },
    orderBy: { paidAt: "desc" },
    include: { _count: { select: { interviews: true } } },
  });
  let ended: JobFeeState["ended"] = null;
  for (const p of paid) {
    const validUntil = p.validUntil ?? new Date((p.paidAt ?? p.createdAt).getTime() + JOB_FEE_VALID_DAYS * 86_400_000);
    const used = p._count.interviews;
    if (validUntil <= now) { ended ??= "time"; continue; }
    if (used >= JOB_FEE_INTERVIEWS) { ended ??= "interviews"; continue; }
    return { active: { id: p.id, paidAt: p.paidAt ?? p.createdAt, validUntil, used, left: JOB_FEE_INTERVIEWS - used }, ended: null, everPaid: true };
  }
  return { active: null, ended, everPaid: paid.length > 0 };
}

export async function visaFeePaid(userId: number) {
  return (await db.payment.count({ where: { userId, kind: "VISA", status: "PAID" } })) > 0;
}

/** Is the member at the step where this fee has to be paid, and not covered yet? */
export async function feeDue(userId: number, stage: number, kind: FeeKind) {
  if (stage !== FEES[kind].stage) return false;
  return kind === "JOB_MATCHING" ? !(await getJobFee(userId)).active : !(await visaFeePaid(userId));
}

type PaidInfo = { method?: string | null; payherePaymentId?: string | null; message?: string | null; reference?: string | null; recordedBy?: string | null };

/** Marks a payment as paid (only once) and tells the member. */
export async function markPaid(paymentId: number, info: PaidInfo) {
  const p = await db.payment.findUnique({ where: { id: paymentId }, include: { user: { include: { registration: true } } } });
  if (!p || p.status === "PAID") return p;
  const paidAt = new Date();
  const validUntil = p.kind === "JOB_MATCHING" ? new Date(paidAt.getTime() + JOB_FEE_VALID_DAYS * 86_400_000) : null;
  const { count } = await db.payment.updateMany({
    where: { id: p.id, status: { not: "PAID" } },
    data: {
      status: "PAID", paidAt, validUntil,
      method: info.method ?? p.method, payherePaymentId: info.payherePaymentId ?? p.payherePaymentId,
      statusMessage: info.message ?? p.statusMessage, reference: info.reference ?? p.reference, recordedBy: info.recordedBy ?? p.recordedBy,
    },
  });
  if (count) {
    const t = makeT(DEFAULT_LOCALE);
    const amount = fmtMoney(p.amountCents, p.currency, DEFAULT_LOCALE);
    const r = p.user.registration;
    await notify({ email: r?.email ?? p.user.email, phone: r?.phone ?? p.user.phone }, t("notify.paidSubject"), t("notify.paidBody", { amount, item: t(`pay.kind.${p.kind as FeeKind}`) }));
    await audit(info.recordedBy || p.user.email, "payment.paid", `${p.orderId} ${p.kind} ${amountString(p.amountCents)} ${p.currency}${info.method ? ` (${info.method})` : ""}`);
  }
  return db.payment.findUnique({ where: { id: p.id } });
}

/** Applies a PayHere status code (2 success, 0 pending, -1 cancelled, -2 failed, -3 charged back). */
export async function applyPayHereStatus(orderId: string, code: number, info: PaidInfo) {
  const p = await db.payment.findUnique({ where: { orderId } });
  if (!p) return null;
  if (code === 2) return markPaid(p.id, info);
  const status = code === -1 ? "CANCELLED" : code === -2 ? "FAILED" : code === -3 ? "CHARGEDBACK" : null;
  if (!status) return p;
  // a paid order only changes again if the money is taken back (charge-back)
  if (p.status === "PAID" && status !== "CHARGEDBACK") return p;
  await db.payment.update({ where: { id: p.id }, data: { status, statusMessage: info.message ?? p.statusMessage, payherePaymentId: info.payherePaymentId ?? p.payherePaymentId } });
  if (status === "CHARGEDBACK") await audit("payhere", "payment.chargeback", orderId);
  return db.payment.findUnique({ where: { id: p.id } });
}

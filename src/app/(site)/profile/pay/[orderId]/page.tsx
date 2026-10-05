import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { getT } from "@/lib/i18n/server";
import { fmtDate } from "@/lib/i18n/dict";
import { amountString, fmtMoney, type FeeKind } from "@/lib/payments/config";
import { retrievePayment } from "@/lib/payments/payhere";
import { markPaid } from "@/lib/payments/status";
import { AutoRefresh } from "@/components/payments/AutoRefresh";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const { t } = await getT();
  return { title: t("pay.statusTitle") };
}

/** Where PayHere sends the member back to (return_url / cancel_url), and the receipt of a payment. */
export default async function PaymentStatus({ params, searchParams }: { params: Promise<{ orderId: string }>; searchParams: Promise<{ from?: string }> }) {
  const s = await requireUser();
  const [{ orderId }, sp] = await Promise.all([params, searchParams]);
  let p = await db.payment.findUnique({ where: { orderId } });
  if (!p || p.userId !== s.uid) notFound();
  const { t, locale } = await getT();

  if (p.status === "PENDING" && sp.from === "cancel") {
    p = await db.payment.update({ where: { id: p.id }, data: { status: "CANCELLED" } });
  } else if (p.status === "PENDING") {
    // the notification may not have arrived yet (or cannot reach this computer) — ask PayHere directly
    const r = await retrievePayment(orderId);
    if (r && r.status === "RECEIVED" && r.amount.toFixed(2) === amountString(p.amountCents) && r.currency === p.currency) {
      p = (await markPaid(p.id, { method: r.method, payherePaymentId: r.paymentId })) ?? p;
    }
  }

  const item = t(`pay.kind.${p.kind as FeeKind}`);
  const look = {
    PAID: { icon: "✓", ring: "bg-emerald-100 text-emerald-700", title: t("pay.paidTitle"), text: t("pay.paidText") },
    PENDING: { icon: "…", ring: "bg-amber-100 text-amber-700", title: t("pay.pendingTitle"), text: t("pay.pendingText") },
    CANCELLED: { icon: "✕", ring: "bg-slate-100 text-slate-600", title: t("pay.cancelledTitle"), text: t("pay.tryAgainText") },
    FAILED: { icon: "!", ring: "bg-red-100 text-red-700", title: t("pay.failedTitle"), text: t("pay.tryAgainText") },
    CHARGEDBACK: { icon: "!", ring: "bg-red-100 text-red-700", title: t("pay.chargedBackTitle"), text: t("pay.contactOffice") },
  }[p.status] ?? { icon: "?", ring: "bg-slate-100 text-slate-600", title: p.status, text: "" };

  return (
    <div className="mx-auto max-w-lg px-4 py-12">
      <div className="card p-8 text-center">
        <div className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full text-2xl font-bold ${look.ring}`}>{look.icon}</div>
        <h1 className="mt-4 text-2xl font-bold text-navy-900">{look.title}</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">{look.text}</p>
        <dl className="mt-6 divide-y divide-slate-100 rounded-lg border border-slate-200 text-left text-sm">
          {[
            [t("pay.item"), item],
            [t("pay.amount"), fmtMoney(p.amountCents, p.currency, locale)],
            [t("pay.orderId"), p.orderId],
            ...(p.paidAt ? [[t("pay.paidOn"), fmtDate(p.paidAt, locale)]] : []),
            ...(p.validUntil ? [[t("pay.validUntil"), fmtDate(p.validUntil, locale)]] : []),
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between gap-4 px-4 py-2.5"><dt className="text-slate-500">{k}</dt><dd className="font-medium text-slate-900">{v}</dd></div>
          ))}
        </dl>
        <Link href="/profile#fees" className="btn-primary mt-6 w-full">{t("pay.backProfile")}</Link>
      </div>
      {p.status === "PENDING" && <AutoRefresh />}
    </div>
  );
}

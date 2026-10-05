import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { getT } from "@/lib/i18n/server";
import { countryName } from "@/lib/geo";
import { amountString, fmtMoney, type FeeKind } from "@/lib/payments/config";
import { checkoutHash, payhereConfig, payhereReady } from "@/lib/payments/payhere";
import { AutoSubmit } from "@/components/payments/AutoSubmit";

export const dynamic = "force-dynamic";

/** Sends the member to the PayHere payment page (the form submits itself). */
export default async function Checkout({ params }: { params: Promise<{ orderId: string }> }) {
  const s = await requireUser();
  const { orderId } = await params;
  const p = await db.payment.findUnique({ where: { orderId }, include: { user: { include: { registration: true } } } });
  if (!p || p.userId !== s.uid) notFound();
  if (p.status !== "PENDING" || !payhereReady()) redirect(`/profile/pay/${orderId}`);
  const { t, locale } = await getT();
  const c = payhereConfig();
  const r = p.user.registration;
  const name = (r?.fullName || p.user.name).trim().split(/\s+/);
  const amount = amountString(p.amountCents);
  const item = t(`pay.kind.${p.kind as FeeKind}`);

  const fields: Record<string, string> = {
    merchant_id: c.merchantId,
    return_url: `${c.siteUrl}/profile/pay/${orderId}?from=return`,
    cancel_url: `${c.siteUrl}/profile/pay/${orderId}?from=cancel`,
    notify_url: `${c.siteUrl}/api/payhere/notify`,
    order_id: orderId,
    items: item,
    currency: p.currency,
    amount,
    first_name: name[0] || "-",
    last_name: name.slice(1).join(" ") || "-",
    email: r?.email || p.user.email,
    phone: r?.phone || p.user.phone || "-",
    address: r?.address || "-",
    city: r?.district || "-",
    country: (r && countryName(r.country, "en")) || "Sri Lanka",
    custom_1: p.kind,
    custom_2: r?.cardNo ?? "",
    hash: checkoutHash(orderId, amount, p.currency),
  };

  return (
    <div className="mx-auto max-w-md px-4 py-16 text-center">
      <div className="card p-8">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-navy-100 border-t-navy-600" />
        <h1 className="mt-5 text-xl font-bold text-navy-900">{t("pay.redirecting")}</h1>
        <p className="mt-2 text-sm text-slate-600">{item} · {fmtMoney(p.amountCents, p.currency, locale)}</p>
        <AutoSubmit action={c.checkoutUrl} fields={fields} label={t("pay.continueToPayHere")} />
        {c.sandbox && <p className="mt-4 text-xs text-amber-600">{t("pay.sandboxNote")}</p>}
      </div>
    </div>
  );
}

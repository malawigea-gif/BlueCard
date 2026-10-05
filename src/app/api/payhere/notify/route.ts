import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { audit } from "@/lib/audit";
import { amountString } from "@/lib/payments/config";
import { verifyNotify, type NotifyFields } from "@/lib/payments/payhere";
import { applyPayHereStatus } from "@/lib/payments/status";

export const dynamic = "force-dynamic";

// PayHere calls this address (notify_url) in the background after every payment attempt.
// It must be reachable from the internet — PayHere cannot reach "localhost".
export async function POST(req: Request) {
  let f: NotifyFields;
  try {
    const fd = await req.formData();
    const get = (k: string) => String(fd.get(k) ?? "");
    f = {
      merchant_id: get("merchant_id"), order_id: get("order_id"), payment_id: get("payment_id"),
      payhere_amount: get("payhere_amount"), payhere_currency: get("payhere_currency"), status_code: get("status_code"),
      md5sig: get("md5sig"), method: get("method"), status_message: get("status_message"),
    };
  } catch {
    return new NextResponse("bad request", { status: 400 });
  }

  if (!verifyNotify(f)) {
    await audit("payhere", "payment.notify.rejected", `invalid signature for ${f.order_id}`);
    return new NextResponse("invalid signature", { status: 400 });
  }
  const p = await db.payment.findUnique({ where: { orderId: f.order_id } });
  if (!p) return new NextResponse("unknown order", { status: 404 });
  const code = Number(f.status_code);
  if (code === 2 && (Number(f.payhere_amount).toFixed(2) !== amountString(p.amountCents) || f.payhere_currency !== p.currency)) {
    await audit("payhere", "payment.notify.mismatch", `${f.order_id}: ${f.payhere_amount} ${f.payhere_currency}`);
    return new NextResponse("amount mismatch", { status: 400 });
  }
  await applyPayHereStatus(f.order_id, code, { method: f.method || null, payherePaymentId: f.payment_id || null, message: f.status_message || null });
  return new NextResponse("ok");
}

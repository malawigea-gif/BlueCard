import "server-only";
import { createHash } from "node:crypto";

// PayHere (https://www.payhere.lk) — Checkout API, payment notification and Retrieval API.
// Settings come from .env:
//   PAYHERE_MERCHANT_ID, PAYHERE_MERCHANT_SECRET   (PayHere → Settings → Domains & Credentials)
//   PAYHERE_SANDBOX="true"                           (test mode; set "false" for real payments)
//   PAYHERE_APP_ID, PAYHERE_APP_SECRET              (optional, PayHere → Settings → API Keys — lets the site
//                                                    check a payment itself when the notification can't reach it)
//   SITE_URL                                        (public address of the site, e.g. https://bluecard.example.com)

const env = (k: string) => (process.env[k] ?? "").trim();
const md5 = (s: string) => createHash("md5").update(s).digest("hex").toUpperCase();

export function payhereConfig() {
  const sandbox = env("PAYHERE_SANDBOX").toLowerCase() !== "false";
  const host = sandbox ? "https://sandbox.payhere.lk" : "https://www.payhere.lk";
  return {
    merchantId: env("PAYHERE_MERCHANT_ID"),
    merchantSecret: env("PAYHERE_MERCHANT_SECRET"),
    appId: env("PAYHERE_APP_ID"),
    appSecret: env("PAYHERE_APP_SECRET"),
    siteUrl: (env("SITE_URL") || "http://localhost:3000").replace(/\/+$/, ""),
    sandbox,
    checkoutUrl: `${host}/pay/checkout`,
    host,
  };
}

export function payhereReady() {
  const c = payhereConfig();
  return !!(c.merchantId && c.merchantSecret);
}

/** The "hash" field of the checkout form. */
export function checkoutHash(orderId: string, amount: string, currency: string) {
  const c = payhereConfig();
  return md5(c.merchantId + orderId + amount + currency + md5(c.merchantSecret));
}

export type NotifyFields = {
  merchant_id: string;
  order_id: string;
  payment_id: string;
  payhere_amount: string;
  payhere_currency: string;
  status_code: string;
  md5sig: string;
  method?: string;
  status_message?: string;
};

/** Checks that a notification really comes from PayHere. */
export function verifyNotify(f: NotifyFields) {
  const c = payhereConfig();
  if (!c.merchantSecret || f.merchant_id !== c.merchantId) return false;
  const expected = md5(f.merchant_id + f.order_id + f.payhere_amount + f.payhere_currency + f.status_code + md5(c.merchantSecret));
  return expected === (f.md5sig || "").toUpperCase();
}

export type RetrievedPayment = { paymentId: string; status: string; amount: number; currency: string; method?: string };

/**
 * Asks PayHere about an order (Retrieval API). Used when the customer comes back to the site but the
 * notification has not arrived (for example on a computer that PayHere cannot reach). Returns null when
 * the API keys are not set or the order is unknown.
 */
export async function retrievePayment(orderId: string): Promise<RetrievedPayment | null> {
  const c = payhereConfig();
  if (!c.appId || !c.appSecret) return null;
  try {
    const tok = await fetch(`${c.host}/merchant/v1/oauth/token`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${c.appId}:${c.appSecret}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
      cache: "no-store",
    });
    if (!tok.ok) return null;
    const { access_token } = (await tok.json()) as { access_token?: string };
    if (!access_token) return null;
    const res = await fetch(`${c.host}/merchant/v1/payment/search?order_id=${encodeURIComponent(orderId)}`, {
      headers: { Authorization: `Bearer ${access_token}`, "Content-Type": "application/json" },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const body = (await res.json()) as { status?: number; data?: { payment_id: number | string; order_id: string; status: string; amount: number; currency: string; payment_method?: { method?: string } }[] };
    const row = body.status === 1 ? body.data?.find((d) => d.order_id === orderId) : undefined;
    if (!row) return null;
    return { paymentId: String(row.payment_id), status: row.status, amount: Number(row.amount), currency: row.currency, method: row.payment_method?.method };
  } catch {
    return null;
  }
}

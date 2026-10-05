// Fees charged on the way to Germany — shared by the server and the browser.
// Change the amounts and limits here.
import type { Locale } from "@/lib/i18n/dict";

export const FEE_KINDS = ["JOB_MATCHING", "VISA"] as const;
export type FeeKind = (typeof FEE_KINDS)[number];

export const FEES: Record<FeeKind, { cents: number; currency: string; stage: number }> = {
  // service fee for step 5 "Job matching & interviews" (after qualification recognition)
  JOB_MATCHING: { cents: 12_00, currency: "USD", stage: 5 },
  // visa & service fee for step 7 "Visa application"
  VISA: { cents: 115_00, currency: "USD", stage: 7 },
};

/** The job matching fee is valid for this many days after payment … */
export const JOB_FEE_VALID_DAYS = 365;
/** … or until this many interviews have been arranged, whichever comes first. */
export const JOB_FEE_INTERVIEWS = 10;

export const PAYMENT_STATUSES = ["PENDING", "PAID", "CANCELLED", "FAILED", "CHARGEDBACK"] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export function isFeeKind(v: unknown): v is FeeKind {
  return typeof v === "string" && (FEE_KINDS as readonly string[]).includes(v);
}

/** "10.00" — the format PayHere expects. */
export function amountString(cents: number) {
  return (cents / 100).toFixed(2);
}

export function fmtMoney(cents: number, currency: string, locale: Locale) {
  return new Intl.NumberFormat(locale === "de" ? "de-DE" : "en-GB", { style: "currency", currency }).format(cents / 100);
}

import { db } from "./db";
import type { Locale } from "./i18n/dict";

export const DEFAULT_SETTINGS = {
  siteName: "Blue Card Programme",
  siteTagline: "Community Welfare and Partnership Programme",
  siteTaglineDe: "",
  logo: "",
  address: "No. 00, Main Street, Colombo",
  addressDe: "",
  phone: "011 000 0000",
  email: "info@bluecard.lk",
  officeHours: "Monday – Friday, 8.30 a.m. – 4.15 p.m.",
  officeHoursDe: "",
  mapEmbed: "",
  facebook: "",
  youtube: "",
  aboutIntro: "",
  aboutIntroDe: "",
  aboutVision: "",
  aboutVisionDe: "",
  aboutMission: "",
  aboutMissionDe: "",
  aboutStructure: "",
  aboutStructureDe: "",
  legalName: "Liyana IT Solutions",
  // Sri Lanka office: shown only in the policy pages (needed for the PayHere merchant review), not on Contact Us or in the footer
  paymentOfficeAddress: "LIT Solutions, 232 Oruwala Rd, 10150",
  paymentOfficePhone: "0742381250",
  policyPrivacy: "",
  policyPrivacyDe: "",
  policyRefund: "",
  policyRefundDe: "",
  policyTerms: "",
  policyTermsDe: "",
};
export type Settings = typeof DEFAULT_SETTINGS;

/** Settings fields that have a German version stored under "<key>De". */
export const TRANSLATABLE = ["siteTagline", "address", "officeHours", "aboutIntro", "aboutVision", "aboutMission", "aboutStructure", "policyPrivacy", "policyRefund", "policyTerms"] as const;

/** Raw settings (both languages) — for the admin forms. */
export async function getAllSettings(): Promise<Settings> {
  const rows = await db.setting.findMany();
  const s: Record<string, string> = { ...DEFAULT_SETTINGS };
  for (const r of rows) s[r.key] = r.value;
  return s as Settings;
}

/** Settings for display: when viewing in German, German texts replace English ones where filled in. */
export async function getSettings(locale: Locale = "en"): Promise<Settings> {
  const s = await getAllSettings();
  if (locale === "de") for (const k of TRANSLATABLE) if (s[`${k}De`]?.trim()) s[k] = s[`${k}De`];
  return s;
}

export async function saveSettings(values: Partial<Settings>) {
  await db.$transaction(
    Object.entries(values).map(([key, value]) =>
      db.setting.upsert({ where: { key }, update: { value: String(value ?? "") }, create: { key, value: String(value ?? "") } })
    )
  );
}

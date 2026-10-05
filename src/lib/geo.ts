import "server-only";
import { Country, State } from "country-state-city";
import type { Locale } from "./i18n/dict";

export type CountryOption = { code: string; name: string; dial: string; flag: string };

function namer(locale: Locale) {
  let dn: Intl.DisplayNames | null = null;
  try { dn = new Intl.DisplayNames([locale], { type: "region" }); } catch {}
  return (code: string, fallback: string) => {
    try { return dn?.of(code) || fallback; } catch { return fallback; }
  };
}

/** All countries with their calling code, names in the visitor's language, sorted alphabetically. */
export function getCountries(locale: Locale): CountryOption[] {
  const name = namer(locale);
  return Country.getAllCountries()
    .map((c) => ({ code: c.isoCode, name: name(c.isoCode, c.name), dial: c.phonecode.replace(/^\+/, "").split(/[ ,]/)[0], flag: c.flag }))
    .sort((a, b) => a.name.localeCompare(b.name, locale));
}

export function getCountry(code: string) {
  return Country.getCountryByCode(code) ?? null;
}

export function countryName(code: string, locale: Locale) {
  if (!code) return "";
  return namer(locale)(code, getCountry(code)?.name ?? code);
}

export function getStates(code: string): string[] {
  if (!/^[A-Z]{2}$/.test(code)) return [];
  return State.getStatesOfCountry(code).map((s) => s.name).sort((a, b) => a.localeCompare(b));
}

export function dialCode(code: string) {
  return getCountry(code)?.phonecode.replace(/^\+/, "").split(/[ ,]/)[0] ?? "";
}

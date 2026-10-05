"use client";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { LOCALES, LOCALE_COOKIE, LOCALE_LABEL, type Locale } from "@/lib/i18n/dict";
import { useLocale, useT } from "@/lib/i18n/client";

export function LanguageSwitcher({ dark = false }: { dark?: boolean }) {
  const current = useLocale();
  const t = useT();
  const router = useRouter();
  const [pending, start] = useTransition();

  function choose(l: Locale) {
    if (l === current) return;
    document.cookie = `${LOCALE_COOKIE}=${l}; path=/; max-age=31536000; samesite=lax`;
    start(() => router.refresh());
  }

  return (
    <div role="group" aria-label={t("nav.language")}
      className={`inline-flex shrink-0 overflow-hidden rounded-lg text-xs font-bold ${dark ? "ring-1 ring-white/25" : "ring-1 ring-slate-300"} ${pending ? "opacity-60" : ""}`}>
      {LOCALES.map((l) => {
        const active = l === current;
        return (
          <button key={l} type="button" onClick={() => choose(l)} title={LOCALE_LABEL[l]} aria-pressed={active} lang={l}
            className={`px-2.5 py-1.5 uppercase tracking-wide transition ${
              active
                ? dark ? "bg-white text-navy-900" : "bg-navy-700 text-white"
                : dark ? "text-navy-100 hover:bg-white/10" : "bg-white text-slate-600 hover:bg-slate-100"
            }`}>
            {l}
          </button>
        );
      })}
    </div>
  );
}

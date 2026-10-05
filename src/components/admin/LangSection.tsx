import { getT } from "@/lib/i18n/server";

/** A card that groups the fields of one content language in the admin forms. */
export async function LangSection({ lang, children }: { lang: "en" | "de"; children: React.ReactNode }) {
  const { t } = await getT();
  return (
    <fieldset className="card space-y-4 p-6" lang={lang}>
      <legend className="sr-only">{t(lang === "en" ? "lang.en" : "lang.de")}</legend>
      <div className="flex flex-wrap items-center gap-3">
        <span className={`rounded-md px-2 py-0.5 text-xs font-bold uppercase tracking-wider ${lang === "en" ? "bg-navy-700 text-white" : "bg-gold-400 text-navy-900"}`}>{lang}</span>
        <h2 className="font-bold text-slate-800">{t(lang === "en" ? "lang.en" : "lang.de")}</h2>
        {lang === "de" && <span className="text-xs text-slate-500">{t("lang.deOptional")}</span>}
      </div>
      {children}
    </fieldset>
  );
}

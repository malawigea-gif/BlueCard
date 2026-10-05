import Link from "next/link";
import { db } from "@/lib/db";
import { getT } from "@/lib/i18n/server";
import { localized } from "@/lib/i18n/dict";
import { RichText } from "@/components/RichText";

export async function generateMetadata() {
  const { t } = await getT();
  return { title: t("nav.programs") };
}

export default async function Programs() {
  const { t, locale } = await getT();
  const programs = await db.program.findMany({ where: { active: true }, orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] });
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-bold text-navy-800">{t("nav.programs")}</h1>
      <p className="mt-2 text-slate-600">{t("programs.intro")}</p>

      <div className="mt-8 space-y-8">
        {programs.map((p, i) => (
          <section key={p.id} className={`card grid overflow-hidden md:grid-cols-5 ${i % 2 ? "md:[&>*:first-child]:order-2" : ""}`}>
            <div className="bg-navy-50 md:col-span-2">
              {p.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.image} alt="" className="h-full max-h-80 w-full object-cover md:max-h-none" />
              ) : (
                <div className="flex h-48 items-center justify-center text-5xl font-bold text-navy-200 md:h-full">{i + 1}</div>
              )}
            </div>
            <div className="p-6 md:col-span-3 md:p-8">
              <h2 className="text-2xl font-bold leading-snug text-navy-900 [text-wrap:balance]">{localized(p, "title", locale)}</h2>
              <RichText text={localized(p, "summary", locale)} className="compact mt-3 font-medium !text-navy-700" />
              <RichText text={localized(p, "body", locale)} className="compact mt-4" />
            </div>
          </section>
        ))}
        {!programs.length && <p className="text-sm text-slate-500">{t("programs.empty")}</p>}
      </div>

      <div className="mt-12 rounded-2xl border-2 border-dashed border-navy-200 bg-white p-8 text-center">
        <h2 className="text-2xl font-bold text-navy-800">{t("programs.ctaTitle")}</h2>
        <p className="mx-auto mt-2 max-w-xl text-slate-600">{t("programs.ctaText")}</p>
        <Link href="/register" className="btn-gold mt-6 px-8 py-3 text-base">{t("home.ctaButton")}</Link>
      </div>
    </div>
  );
}

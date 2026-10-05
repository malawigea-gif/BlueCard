import Link from "next/link";
import { db } from "@/lib/db";
import { getT } from "@/lib/i18n/server";
import { localized } from "@/lib/i18n/dict";
import { ArticleCard } from "@/components/ArticleCard";
import { Gallery } from "@/components/Gallery";

export default async function Home() {
  const { t, locale } = await getT();
  const featured = await db.article.findMany({ where: { published: true, featured: true }, orderBy: { createdAt: "desc" }, take: 3 });
  const fill = featured.length < 3
    ? await db.article.findMany({ where: { published: true, id: { notIn: featured.map((a) => a.id) } }, orderBy: { createdAt: "desc" }, take: 3 - featured.length })
    : [];
  const articles = [...featured, ...fill].map((a) => ({ ...a, title: localized(a, "title", locale), summary: localized(a, "summary", locale) }));
  const images = (await db.galleryImage.findMany({ orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }], take: 12 }))
    .map((g) => ({ id: g.id, url: g.url, caption: (locale === "de" && g.captionDe) || g.caption }));

  return (
    <div className="mx-auto max-w-6xl px-4">
      <section className="py-10">
        <div className="mb-6 flex items-end justify-between gap-4">
          <h2 className="text-2xl font-bold text-navy-800">{t("home.latest")}</h2>
          <Link href="/news" className="text-sm font-semibold text-navy-600 hover:text-navy-800">{t("common.viewAll")}</Link>
        </div>
        {articles.length ? (
          <div className="grid gap-6 md:grid-cols-3">
            {articles.map((a) => <ArticleCard key={a.id} a={a} locale={locale} readMore={t("common.readMore")} />)}
          </div>
        ) : (
          <p className="text-sm text-slate-500">{t("home.noArticles")}</p>
        )}
      </section>

      <section className="pb-6">
        <h2 className="mb-6 text-2xl font-bold text-navy-800">{t("home.gallery")}</h2>
        <Gallery images={images} />
      </section>

      <section className="mt-10 overflow-hidden rounded-2xl bg-navy-800 px-6 py-8 text-white sm:flex sm:items-center sm:justify-between sm:px-10">
        <div>
          <div className="text-xl font-bold">{t("home.ctaTitle")}</div>
          <p className="mt-1 text-sm text-navy-100">{t("home.ctaText")}</p>
        </div>
        <Link href="/register" className="btn-gold mt-4 sm:mt-0">{t("home.ctaButton")}</Link>
      </section>
    </div>
  );
}

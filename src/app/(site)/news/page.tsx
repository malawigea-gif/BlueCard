import { db } from "@/lib/db";
import { getT } from "@/lib/i18n/server";
import { localized } from "@/lib/i18n/dict";
import { ArticleCard } from "@/components/ArticleCard";

export async function generateMetadata() {
  const { t } = await getT();
  return { title: t("nav.news") };
}

export default async function News() {
  const { t, locale } = await getT();
  const articles = (await db.article.findMany({ where: { published: true }, orderBy: { createdAt: "desc" } }))
    .map((a) => ({ ...a, title: localized(a, "title", locale), summary: localized(a, "summary", locale) }));
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="mb-6 text-3xl font-bold text-navy-800">{t("news.title")}</h1>
      <div className="grid gap-6 md:grid-cols-3">
        {articles.map((a) => <ArticleCard key={a.id} a={a} locale={locale} readMore={t("common.readMore")} />)}
      </div>
      {!articles.length && <p className="text-sm text-slate-500">{t("home.noArticles")}</p>}
    </div>
  );
}

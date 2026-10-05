import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { getT } from "@/lib/i18n/server";
import { fmtDate, localized } from "@/lib/i18n/dict";
import { RichText, inline } from "@/components/RichText";
import { plainText } from "@/lib/text";

async function load(slug: string) {
  const a = await db.article.findUnique({ where: { slug: decodeURIComponent(slug) } });
  return a && a.published ? a : null;
}

// If the article text starts by repeating the title (as "# Title" or "**Title**"), drop that line.
function withoutRepeatedTitle(body: string, title: string) {
  const norm = (x: string) => x.replace(/[#*]/g, "").replace(/\s+/g, " ").trim().toLowerCase();
  const lines = body.replace(/\r\n?/g, "\n").split("\n");
  const i = lines.findIndex((l) => l.trim());
  if (i >= 0 && norm(lines[i]) === norm(title)) lines.splice(i, 1);
  return lines.join("\n").trim();
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const [{ locale }, a] = await Promise.all([getT(), load((await params).slug)]);
  return a ? { title: localized(a, "title", locale), description: plainText(localized(a, "summary", locale)).slice(0, 160) } : {};
}

export default async function Article({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [{ t, locale }, a] = await Promise.all([getT(), load(slug)]);
  if (!a) notFound();
  const title = localized(a, "title", locale);
  const summary = localized(a, "summary", locale);
  const body = withoutRepeatedTitle(localized(a, "body", locale), title);
  return (
    <article className="mx-auto max-w-3xl px-4 py-10">
      <Link href="/news" className="text-sm text-navy-600 hover:text-navy-800">{t("news.back")}</Link>
      <time dateTime={a.createdAt.toISOString()} className="mt-4 block text-sm text-slate-500">{fmtDate(a.createdAt, locale)}</time>
      <h1 className="mt-1 text-3xl font-extrabold leading-snug text-navy-900 [text-wrap:balance] md:text-4xl">{title}</h1>
      {a.image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={a.image} alt="" className="mt-6 w-full rounded-xl object-cover" />
      )}
      <p className="mt-6 border-l-4 border-gold-400 pl-4 text-lg font-medium leading-8 text-slate-700">{inline(summary.replace(/\r?\n/g, " ").replace(/\s+/g, " "))}</p>
      {body && <RichText text={body} className="mt-8 text-base leading-8" />}
    </article>
  );
}

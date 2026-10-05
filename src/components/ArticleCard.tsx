import Link from "next/link";
import { fmtDate, type Locale } from "@/lib/i18n/dict";
import { plainText } from "@/lib/text";

type A = { slug: string; title: string; summary: string; image: string | null; createdAt: Date };

export function ArticleCard({ a, locale, readMore }: { a: A; locale: Locale; readMore: string }) {
  return (
    <article className="card group flex flex-col overflow-hidden transition hover:shadow-md">
      <Link href={`/news/${a.slug}`} className="block aspect-[16/10] overflow-hidden bg-navy-50" tabIndex={-1} aria-hidden>
        {a.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={a.image} alt="" className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]" />
        ) : (
          <div className="flex h-full items-center justify-center text-navy-200">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M7 8h10M7 12h10M7 16h6" /></svg>
          </div>
        )}
      </Link>
      <div className="flex flex-1 flex-col p-5">
        <time dateTime={a.createdAt.toISOString()} className="text-xs font-semibold uppercase tracking-wide text-navy-600">{fmtDate(a.createdAt, locale)}</time>
        <h3 className="mt-2 text-lg font-bold leading-snug text-slate-900 [text-wrap:balance]">
          <Link href={`/news/${a.slug}`} className="hover:text-navy-700">{a.title}</Link>
        </h3>
        <p className="mt-2 line-clamp-4 flex-1 text-sm leading-6 text-slate-600">{plainText(a.summary)}</p>
        <Link href={`/news/${a.slug}`} className="mt-4 text-sm font-semibold text-navy-600 hover:text-navy-800">{readMore}</Link>
      </div>
    </article>
  );
}

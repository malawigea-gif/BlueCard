import Link from "next/link";
import { db } from "@/lib/db";
import { getT } from "@/lib/i18n/server";
import { fmtDate, localized } from "@/lib/i18n/dict";
import { PageTitle } from "@/components/admin/PageTitle";
import { Flash, type SP } from "@/components/admin/Flash";

export default async function NewsAdmin({ searchParams }: { searchParams: SP }) {
  const { t, locale } = await getT();
  const items = await db.article.findMany({ orderBy: { createdAt: "desc" } });
  return (
    <>
      <PageTitle title={t("admin.nav.news")} sub={t("anews.sub")} action={<Link href="/admin/news/new" className="btn-primary">{t("anews.new")}</Link>} />
      <Flash searchParams={searchParams} />
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-600"><tr><th className="px-4 py-3">{t("anews.colTitle")}</th><th className="px-4 py-3">EN / DE</th><th className="px-4 py-3">{t("anews.colDate")}</th><th className="px-4 py-3">{t("anews.colStatus")}</th><th /></tr></thead>
          <tbody className="divide-y divide-slate-100">
            {items.map((a) => (
              <tr key={a.id}>
                <td className="px-4 py-3 font-semibold text-slate-900">{a.featured && <span className="mr-1 text-gold-500">★</span>}{localized(a, "title", locale)}</td>
                <td className="whitespace-nowrap px-4 py-3">
                  <span className="badge bg-navy-50 text-navy-700">EN</span>{" "}
                  <span className={`badge ${a.titleDe ? "bg-amber-100 text-amber-800" : "bg-slate-100 text-slate-400 line-through"}`}>DE</span>
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-slate-500">{fmtDate(a.createdAt, locale)}</td>
                <td className="px-4 py-3">{a.published ? <span className="badge bg-emerald-100 text-emerald-700">{t("anews.published")}</span> : <span className="badge bg-slate-100 text-slate-600">{t("anews.draft")}</span>}</td>
                <td className="px-4 py-3 text-right"><Link href={`/admin/news/${a.id}`} className="text-navy-600 hover:underline">{t("anews.edit")}</Link></td>
              </tr>
            ))}
            {!items.length && <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-500">{t("anews.empty")}</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}

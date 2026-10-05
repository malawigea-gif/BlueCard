import Link from "next/link";
import { db } from "@/lib/db";
import { getT } from "@/lib/i18n/server";
import { localized } from "@/lib/i18n/dict";
import { plainText } from "@/lib/text";
import { PageTitle } from "@/components/admin/PageTitle";
import { Flash, type SP } from "@/components/admin/Flash";

export default async function ProgramsAdmin({ searchParams }: { searchParams: SP }) {
  const { t, locale } = await getT();
  const items = await db.program.findMany({ orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] });
  return (
    <>
      <PageTitle title={t("admin.nav.programs")} sub={t("aprog.sub")} action={<Link href="/admin/programs/new" className="btn-primary">{t("aprog.new")}</Link>} />
      <Flash searchParams={searchParams} />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {items.map((p) => (
          <Link key={p.id} href={`/admin/programs/${p.id}`} className="card overflow-hidden transition hover:shadow-md">
            <div className="aspect-[16/9] bg-navy-50">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {p.image && <img src={p.image} alt="" className="h-full w-full object-cover" />}
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between gap-2">
                <div className="font-bold text-slate-900">{localized(p, "title", locale)}</div>
                <div className="flex shrink-0 gap-1">
                  {!p.titleDe && <span className="badge bg-slate-100 text-slate-400 line-through">DE</span>}
                  {!p.active && <span className="badge bg-slate-100 text-slate-600">{t("aprog.hidden")}</span>}
                </div>
              </div>
              <p className="mt-1 line-clamp-2 text-sm text-slate-600">{plainText(localized(p, "summary", locale))}</p>
            </div>
          </Link>
        ))}
        {!items.length && <p className="text-sm text-slate-500">{t("aprog.empty")}</p>}
      </div>
    </>
  );
}

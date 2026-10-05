import Link from "next/link";
import { db } from "@/lib/db";
import { getT } from "@/lib/i18n/server";
import { fmtDate } from "@/lib/i18n/dict";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { PageTitle } from "@/components/admin/PageTitle";

export default async function Dashboard() {
  const { t, locale } = await getT();
  const [pending, approved, rejected, articles, images, unread, recent, logs] = await Promise.all([
    db.registration.count({ where: { status: "PENDING" } }),
    db.registration.count({ where: { status: "APPROVED" } }),
    db.registration.count({ where: { status: "REJECTED" } }),
    db.article.count(),
    db.galleryImage.count(),
    db.contactMessage.count({ where: { isRead: false } }),
    db.registration.findMany({ orderBy: { createdAt: "desc" }, take: 6 }),
    db.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: 8 }),
  ]);
  const stats = [
    { label: t("dash.pending"), value: pending, href: "/admin/registrations?status=PENDING", accent: true },
    { label: t("dash.approved"), value: approved, href: "/admin/registrations?status=APPROVED" },
    { label: t("dash.rejected"), value: rejected, href: "/admin/registrations?status=REJECTED" },
    { label: t("dash.unread"), value: unread, href: "/admin/messages" },
    { label: t("dash.articles"), value: articles, href: "/admin/news" },
    { label: t("dash.photos"), value: images, href: "/admin/gallery" },
  ];
  return (
    <>
      <PageTitle title={t("admin.nav.dashboard")} sub={t("dash.sub")} />
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className={`card p-4 transition hover:shadow-md ${s.accent && s.value ? "border-gold-400 bg-amber-50" : ""}`}>
            <div className="text-3xl font-bold text-navy-800">{s.value}</div>
            <div className="mt-1 text-xs leading-5 text-slate-600">{s.label}</div>
          </Link>
        ))}
      </div>
      <div className="mt-8 grid gap-6 xl:grid-cols-2">
        <div className="card">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
            <h2 className="font-bold text-slate-800">{t("dash.latestApps")}</h2>
            <Link href="/admin/registrations" className="text-sm text-navy-600 hover:underline">{t("dash.all")}</Link>
          </div>
          <ul className="divide-y divide-slate-100">
            {recent.map((r) => (
              <li key={r.id}>
                <Link href={`/admin/registrations/${r.id}`} className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-slate-50">
                  <div className="min-w-0"><div className="truncate font-medium text-slate-900">{r.fullName}</div><div className="text-xs text-slate-500">{r.nic} · {fmtDate(r.createdAt, locale)}</div></div>
                  <StatusBadge status={r.status} />
                </Link>
              </li>
            ))}
            {!recent.length && <li className="px-5 py-6 text-sm text-slate-500">{t("dash.noApps")}</li>}
          </ul>
        </div>
        <div className="card">
          <div className="border-b border-slate-100 px-5 py-3"><h2 className="font-bold text-slate-800">{t("dash.activity")}</h2></div>
          <ul className="divide-y divide-slate-100 text-sm">
            {logs.map((l) => (
              <li key={l.id} className="flex justify-between gap-3 px-5 py-2.5">
                <span className="min-w-0 truncate"><b className="text-slate-800">{l.actor}</b> — {l.action}{l.detail ? `: ${l.detail}` : ""}</span>
                <span className="shrink-0 text-xs text-slate-400">{l.createdAt.toISOString().slice(0, 16).replace("T", " ")}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}


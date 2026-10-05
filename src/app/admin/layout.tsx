import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { getT } from "@/lib/i18n/server";
import { AdminNav } from "@/components/admin/AdminNav";
import { Logo } from "@/components/Logo";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { logoutAction } from "@/app/actions/auth";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin" };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const s = await requireAdmin();
  const { t, locale } = await getT();
  const [settings, pending, unread] = await Promise.all([
    getSettings(locale),
    db.registration.count({ where: { status: "PENDING" } }),
    db.contactMessage.count({ where: { isRead: false } }),
  ]);
  return (
    <div className="min-h-screen lg:flex">
      <aside className="bg-navy-900 lg:sticky lg:top-0 lg:h-screen lg:w-64 lg:shrink-0 lg:overflow-y-auto">
        <div className="flex items-center gap-3 border-b border-white/10 px-4 py-4">
          <Logo src={settings.logo} size={36} />
          <div className="min-w-0">
            <div className="truncate text-sm font-bold text-white">{settings.siteName}</div>
            <div className="text-xs text-navy-200">{t("admin.panel")}</div>
          </div>
        </div>
        <AdminNav counts={{ pending, unread }} />
      </aside>
      <div className="min-w-0 flex-1">
        <header className="flex items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3 lg:px-8">
          <Link href="/" target="_blank" className="text-sm text-navy-600 hover:underline">{t("admin.viewSite")}</Link>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <span className="hidden text-sm text-slate-600 sm:inline">{s.name}</span>
            <form action={logoutAction}><button className="btn-outline py-1.5">{t("nav.logout")}</button></form>
          </div>
        </header>
        <main className="px-4 py-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}

import Link from "next/link";
import { Logo } from "./Logo";
import { getSession } from "@/lib/auth";
import { getSettings } from "@/lib/settings";
import { getT } from "@/lib/i18n/server";
import { NavLinks } from "./NavLinks";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { logoutAction } from "@/app/actions/auth";

export async function SiteHeader() {
  const { t, locale } = await getT();
  const [s, session] = await Promise.all([getSettings(locale), getSession()]);
  return (
    <header className="bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-4">
        <Link href="/" className="flex min-w-0 items-center gap-3">
          <Logo src={s.logo} size={52} />
          <div className="min-w-0">
            <div className="truncate text-lg font-bold text-navy-800 sm:text-xl">{s.siteName}</div>
            <div className="truncate text-xs text-slate-500 sm:text-sm">{s.siteTagline}</div>
          </div>
        </Link>
        <div className="flex shrink-0 items-center gap-2">
          <LanguageSwitcher />
          {session ? (
            <>
              <Link href={session.role === "ADMIN" ? "/admin" : "/profile"} className="btn-outline hidden sm:inline-flex">
                {session.role === "ADMIN" ? t("nav.admin") : t("nav.myProfile")}
              </Link>
              <form action={logoutAction}>
                <button className="btn-primary">{t("nav.logout")}</button>
              </form>
            </>
          ) : (
            <Link href="/login" className="btn-primary">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3" /></svg>
              {t("nav.login")}
            </Link>
          )}
        </div>
      </div>
      <nav className="bg-navy-800">
        <div className="mx-auto max-w-6xl px-4">
          <NavLinks />
        </div>
      </nav>
    </header>
  );
}

import Link from "next/link";
import { getSettings } from "@/lib/settings";
import { getT } from "@/lib/i18n/server";

export async function SiteFooter() {
  const { t, locale } = await getT();
  const s = await getSettings(locale);
  return (
    <footer className="mt-16 bg-navy-900 text-navy-100">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-3">
        <div>
          <div className="text-lg font-bold text-white">{s.siteName}</div>
          <p className="mt-2 text-sm leading-6">{s.siteTagline}</p>
        </div>
        <div className="text-sm leading-7">
          <div className="mb-1 font-semibold text-white">{t("footer.contact")}</div>
          <div className="whitespace-pre-line">{s.address}</div>
          <div>{t("common.phoneShort")}: {s.phone}</div>
          <div>{t("common.email")}: {s.email}</div>
        </div>
        <div className="text-sm leading-7">
          <div className="mb-1 font-semibold text-white">{t("footer.links")}</div>
          <div><Link href="/programs" className="hover:text-white">{t("nav.programs")}</Link></div>
          <div><Link href="/register" className="hover:text-white">{t("footer.register")}</Link></div>
          <div><Link href="/news" className="hover:text-white">{t("nav.news")}</Link></div>
          {s.facebook && <div><a href={s.facebook} target="_blank" rel="noreferrer" className="hover:text-white">Facebook</a></div>}
          {s.youtube && <div><a href={s.youtube} target="_blank" rel="noreferrer" className="hover:text-white">YouTube</a></div>}
        </div>
      </div>
      <div className="border-t border-navy-800 py-4 text-center text-xs text-navy-200">
        © {new Date().getFullYear()} {s.siteName}. {t("footer.rights")}
      </div>
    </footer>
  );
}

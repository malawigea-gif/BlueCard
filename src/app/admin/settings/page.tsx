import { getAllSettings } from "@/lib/settings";
import { getT } from "@/lib/i18n/server";
import { saveSiteSettings } from "@/app/actions/admin";
import { PageTitle } from "@/components/admin/PageTitle";
import { Flash, type SP } from "@/components/admin/Flash";
import { Logo } from "@/components/Logo";

export default async function SettingsAdmin({ searchParams }: { searchParams: SP }) {
  const { t } = await getT();
  const s = await getAllSettings();
  return (
    <>
      <PageTitle title={t("admin.nav.settings")} sub={t("aset.sub")} />
      <Flash searchParams={searchParams} />
      <form action={saveSiteSettings} className="card max-w-2xl space-y-4 p-6">
        <input type="hidden" name="_back" value="/admin/settings" />
        <div><label className="label">{t("aset.siteName")}</label><input name="siteName" defaultValue={s.siteName} className="input" required /></div>
        <div><label className="label">{t("aset.tagline")} (EN)</label><input name="siteTagline" defaultValue={s.siteTagline} className="input" lang="en" /></div>
        <div><label className="label">{t("aset.tagline")} (DE)</label><input name="siteTaglineDe" defaultValue={s.siteTaglineDe} className="input" lang="de" /></div>
        <div>
          <label className="label">{t("aset.logo")}</label>
          <div className="flex items-center gap-4">
            <Logo src={s.logo} size={64} />
            <div className="space-y-2">
              <input type="file" name="logo" accept="image/*" className="text-sm" />
              {s.logo && <label className="flex items-center gap-2 text-sm text-slate-600"><input type="checkbox" name="removeLogo" /> {t("aset.defaultLogo")}</label>}
            </div>
          </div>
        </div>
        <button className="btn-primary">{t("common.save")}</button>
      </form>
    </>
  );
}

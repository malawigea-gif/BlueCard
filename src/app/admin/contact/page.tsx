import { getAllSettings } from "@/lib/settings";
import { getT } from "@/lib/i18n/server";
import { saveSiteSettings } from "@/app/actions/admin";
import { PageTitle } from "@/components/admin/PageTitle";
import { Flash, type SP } from "@/components/admin/Flash";

export default async function ContactAdmin({ searchParams }: { searchParams: SP }) {
  const { t } = await getT();
  const s = await getAllSettings();
  return (
    <>
      <PageTitle title={t("admin.nav.contact")} sub={t("acontact.sub")} />
      <Flash searchParams={searchParams} />
      <form action={saveSiteSettings} className="card max-w-3xl space-y-4 p-6">
        <input type="hidden" name="_back" value="/admin/contact" />
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label className="label">{t("acontact.address")} (EN)</label><textarea name="address" rows={2} defaultValue={s.address} className="input" lang="en" /></div>
          <div><label className="label">{t("acontact.address")} (DE)</label><textarea name="addressDe" rows={2} defaultValue={s.addressDe} className="input" lang="de" /></div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label className="label">{t("acontact.phone")}</label><input name="phone" defaultValue={s.phone} className="input" /></div>
          <div><label className="label">{t("acontact.email")}</label><input name="email" defaultValue={s.email} className="input" /></div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label className="label">{t("acontact.hours")} (EN)</label><input name="officeHours" defaultValue={s.officeHours} className="input" lang="en" /></div>
          <div><label className="label">{t("acontact.hours")} (DE)</label><input name="officeHoursDe" defaultValue={s.officeHoursDe} className="input" lang="de" /></div>
        </div>
        <div>
          <label className="label">{t("acontact.map")}</label>
          <textarea name="mapEmbed" rows={2} defaultValue={s.mapEmbed} className="input font-mono text-xs" placeholder={t("acontact.mapHint")} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label className="label">{t("acontact.facebook")}</label><input name="facebook" defaultValue={s.facebook} className="input" /></div>
          <div><label className="label">{t("acontact.youtube")}</label><input name="youtube" defaultValue={s.youtube} className="input" /></div>
        </div>
        <button className="btn-primary">{t("common.save")}</button>
      </form>
    </>
  );
}

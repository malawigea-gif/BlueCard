import Link from "next/link";
import { getAllSettings } from "@/lib/settings";
import { saveSiteSettings } from "@/app/actions/admin";
import { getT } from "@/lib/i18n/server";
import { PageTitle } from "@/components/admin/PageTitle";
import { Flash, type SP } from "@/components/admin/Flash";
import { LangSection } from "@/components/admin/LangSection";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { DEFAULT_POLICIES, POLICIES, POLICY_IDS } from "@/lib/policies";

export default async function PoliciesAdmin({ searchParams }: { searchParams: SP }) {
  const { t } = await getT();
  const s = await getAllSettings();
  return (
    <>
      <PageTitle title={t("admin.nav.policies")} sub={t("apol.sub")} />
      <Flash searchParams={searchParams} />
      <form action={saveSiteSettings} className="space-y-4">
        <input type="hidden" name="_back" value="/admin/policies" />
        <div className="card space-y-3 p-6">
          <label className="block">
            <span className="label">{t("apol.legalName")}</span>
            <input name="legalName" className="input" defaultValue={s.legalName} maxLength={160} />
          </label>
          <p className="text-xs leading-5 text-slate-500">{t("apol.hint")}</p>
          <div className="flex flex-wrap gap-4 text-sm">
            {POLICY_IDS.map((id) => <Link key={id} href={POLICIES[id].path} target="_blank" className="text-navy-600 hover:underline">{t(POLICIES[id].title)} ↗</Link>)}
          </div>
        </div>
        {(["en", "de"] as const).map((l) => (
          <LangSection key={l} lang={l}>
            {POLICY_IDS.map((id) => {
              const name = l === "de" ? (`${POLICIES[id].key}De` as const) : POLICIES[id].key;
              return <RichTextEditor key={id} name={name} lang={l} rows={18} label={t(POLICIES[id].title)} defaultValue={s[name] || DEFAULT_POLICIES[l][id]} />;
            })}
          </LangSection>
        ))}
        <button className="btn-primary">{t("common.save")}</button>
      </form>
    </>
  );
}

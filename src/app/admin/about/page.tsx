import { getAllSettings } from "@/lib/settings";
import { saveSiteSettings } from "@/app/actions/admin";
import { getT } from "@/lib/i18n/server";
import { PageTitle } from "@/components/admin/PageTitle";
import { Flash, type SP } from "@/components/admin/Flash";
import { LangSection } from "@/components/admin/LangSection";
import { RichTextEditor } from "@/components/admin/RichTextEditor";

export default async function AboutAdmin({ searchParams }: { searchParams: SP }) {
  const { t } = await getT();
  const s = await getAllSettings();
  return (
    <>
      <PageTitle title={t("admin.nav.about")} sub={t("aabout.formatHint")} />
      <Flash searchParams={searchParams} />
      <form action={saveSiteSettings} className="space-y-4">
        <input type="hidden" name="_back" value="/admin/about" />
        {(["en", "de"] as const).map((l) => {
          const k = (f: "aboutIntro" | "aboutVision" | "aboutMission" | "aboutStructure") => (l === "de" ? (`${f}De` as const) : f);
          return (
            <LangSection key={l} lang={l}>
              <RichTextEditor name={k("aboutIntro")} lang={l} rows={10} label={t("aabout.intro")} defaultValue={s[k("aboutIntro")]} />
              <div className="grid gap-4 lg:grid-cols-2">
                <RichTextEditor name={k("aboutVision")} lang={l} rows={10} label={t("aabout.vision")} defaultValue={s[k("aboutVision")]} />
                <RichTextEditor name={k("aboutMission")} lang={l} rows={10} label={t("aabout.mission")} defaultValue={s[k("aboutMission")]} />
              </div>
              <RichTextEditor name={k("aboutStructure")} lang={l} rows={16} label={`${t("aabout.structure")} ${t("aabout.structureHint")}`} defaultValue={s[k("aboutStructure")]} />
            </LangSection>
          );
        })}
        <button className="btn-primary">{t("common.save")}</button>
      </form>
    </>
  );
}

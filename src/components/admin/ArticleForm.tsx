import Link from "next/link";
import { saveArticle, deleteArticle } from "@/app/actions/admin";
import { getT } from "@/lib/i18n/server";
import { ImageField } from "./ImageField";
import { ConfirmButton } from "./ConfirmButton";
import { LangSection } from "./LangSection";
import { RichTextEditor } from "./RichTextEditor";

type A = {
  id: number; title: string; titleDe: string; summary: string; summaryDe: string; body: string; bodyDe: string;
  image: string | null; featured: boolean; published: boolean;
};

export async function ArticleForm({ a }: { a?: A }) {
  const { t } = await getT();
  return (
    <div className="space-y-4">
      <form action={saveArticle} className="space-y-4">
        {a && <input type="hidden" name="id" value={a.id} />}
        <div className="grid gap-4 2xl:grid-cols-2 2xl:items-start">
          <LangSection lang="en">
            <div><label className="label">{t("anews.title")}</label><input name="title" defaultValue={a?.title} className="input text-base font-bold" required /></div>
            <RichTextEditor name="summary" lang="en" rows={3} label={`${t("anews.summary")} ${t("anews.summaryHint")}`} defaultValue={a?.summary} />
            <RichTextEditor name="body" lang="en" rows={14} label={t("anews.body")} defaultValue={a?.body} />
          </LangSection>
          <LangSection lang="de">
            <div><label className="label">{t("anews.titleDe")}</label><input name="titleDe" defaultValue={a?.titleDe} className="input text-base font-bold" /></div>
            <RichTextEditor name="summaryDe" lang="de" rows={3} label={`${t("anews.summaryDe")} ${t("anews.summaryHint")}`} defaultValue={a?.summaryDe} />
            <RichTextEditor name="bodyDe" lang="de" rows={14} label={t("anews.body")} defaultValue={a?.bodyDe} />
          </LangSection>
        </div>
        <div className="card space-y-4 p-6">
          <ImageField current={a?.image} label={t("anews.image")} />
          <div className="flex flex-wrap gap-6 text-sm">
            <label className="flex items-center gap-2"><input type="checkbox" name="published" defaultChecked={a ? a.published : true} /> {t("anews.publish")}</label>
            <label className="flex items-center gap-2"><input type="checkbox" name="featured" defaultChecked={a?.featured} /> {t("anews.feature")}</label>
          </div>
          <div className="flex gap-2"><button className="btn-primary">{t("common.save")}</button><Link href="/admin/news" className="btn-outline">{t("common.cancel")}</Link></div>
        </div>
      </form>
      {a && (
        <form action={deleteArticle}><input type="hidden" name="id" value={a.id} /><ConfirmButton message={t("anews.deleteConfirm")}>{t("anews.deleteBtn")}</ConfirmButton></form>
      )}
    </div>
  );
}

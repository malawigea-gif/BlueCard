import Link from "next/link";
import { saveProgram, deleteProgram } from "@/app/actions/admin";
import { getT } from "@/lib/i18n/server";
import { ImageField } from "./ImageField";
import { ConfirmButton } from "./ConfirmButton";
import { LangSection } from "./LangSection";
import { RichTextEditor } from "./RichTextEditor";

type P = {
  id: number; title: string; titleDe: string; summary: string; summaryDe: string; body: string; bodyDe: string;
  image: string | null; sortOrder: number; active: boolean;
};

export async function ProgramForm({ p }: { p?: P }) {
  const { t } = await getT();
  return (
    <div className="space-y-4">
      <form action={saveProgram} className="space-y-4">
        {p && <input type="hidden" name="id" value={p.id} />}
        <div className="grid gap-4 2xl:grid-cols-2 2xl:items-start">
          <LangSection lang="en">
            <div><label className="label">{t("aprog.name")}</label><input name="title" defaultValue={p?.title} className="input text-base font-bold" required /></div>
            <RichTextEditor name="summary" lang="en" rows={2} label={t("aprog.summary")} defaultValue={p?.summary} />
            <RichTextEditor name="body" lang="en" rows={10} label={t("aprog.body")} defaultValue={p?.body} />
          </LangSection>
          <LangSection lang="de">
            <div><label className="label">{t("aprog.nameDe")}</label><input name="titleDe" defaultValue={p?.titleDe} className="input text-base font-bold" /></div>
            <RichTextEditor name="summaryDe" lang="de" rows={2} label={t("aprog.summary")} defaultValue={p?.summaryDe} />
            <RichTextEditor name="bodyDe" lang="de" rows={10} label={t("aprog.body")} defaultValue={p?.bodyDe} />
          </LangSection>
        </div>
        <div className="card space-y-4 p-6">
          <div className="max-w-40"><label className="label">{t("aprog.order")}</label><input name="sortOrder" type="number" defaultValue={p?.sortOrder ?? 0} className="input" /></div>
          <ImageField current={p?.image} label={t("aprog.image")} />
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="active" defaultChecked={p ? p.active : true} /> {t("aprog.active")}</label>
          <div className="flex gap-2"><button className="btn-primary">{t("common.save")}</button><Link href="/admin/programs" className="btn-outline">{t("common.cancel")}</Link></div>
        </div>
      </form>
      {p && <form action={deleteProgram}><input type="hidden" name="id" value={p.id} /><ConfirmButton message={t("aprog.deleteConfirm")}>{t("aprog.deleteBtn")}</ConfirmButton></form>}
    </div>
  );
}

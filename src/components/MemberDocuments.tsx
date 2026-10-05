"use client";
import { useActionState, useRef, useEffect } from "react";
import { uploadMemberDocument, deleteMemberDocument } from "@/app/actions/member";
import { DOC_KINDS } from "@/lib/journey";
import { useT } from "@/lib/i18n/client";
import { Alert } from "./Alert";

type Doc = { id: number; kind: string; name: string; file: string; date: string };

export function MemberDocuments({ docs }: { docs: Doc[] }) {
  const t = useT();
  const [state, action, pending] = useActionState(uploadMemberDocument, undefined);
  const form = useRef<HTMLFormElement>(null);
  useEffect(() => { if (state?.ok) form.current?.reset(); }, [state]);
  const kindLabel = (k: string) => ((DOC_KINDS as readonly string[]).includes(k) ? t(`docs.kind.${k as (typeof DOC_KINDS)[number]}`) : k);

  return (
    <section className="card p-6 md:p-8 print:hidden">
      <h2 className="text-xl font-bold text-navy-800">{t("docs.title")}</h2>
      <p className="mt-1 text-sm text-slate-500">{t("docs.sub")}</p>

      <form ref={form} action={action} className="mt-5 grid gap-3">
        <div>
          <label className="label">{t("docs.kind")}</label>
          <select name="kind" className="input" required defaultValue="">
            <option value="" disabled>{t("register.select")}</option>
            {DOC_KINDS.map((k) => <option key={k} value={k}>{kindLabel(k)}</option>)}
          </select>
        </div>
        <div>
          <label className="label">{t("docs.file")}</label>
          <input name="file" type="file" accept="image/*,application/pdf" required className="input file:mr-3 file:rounded file:border-0 file:bg-navy-50 file:px-3 file:py-1 file:text-navy-700" />
        </div>
        <button className="btn-primary w-full sm:w-auto sm:justify-self-start" disabled={pending}>{pending ? t("docs.uploading") : t("docs.upload")}</button>
      </form>
      <div className="mt-3"><Alert error={state?.error} ok={state?.ok} /></div>

      {docs.length ? (
        <ul className="mt-4 divide-y divide-slate-100 rounded-lg border border-slate-200">
          {docs.map((d) => (
            <li key={d.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm">
              <div className="min-w-0">
                <span className="badge mr-2 bg-navy-50 text-navy-700">{kindLabel(d.kind)}</span>
                <a href={d.file} target="_blank" className="font-medium text-slate-800 hover:text-navy-700 hover:underline">{d.name}</a>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-400">
                {d.date}
                <form action={deleteMemberDocument} onSubmit={(e) => { if (!confirm(t("docs.deleteConfirm"))) e.preventDefault(); }}>
                  <input type="hidden" name="id" value={d.id} />
                  <button className="font-medium text-red-600 hover:underline">{t("docs.delete")}</button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      ) : <p className="mt-4 text-sm text-slate-500">{t("docs.empty")}</p>}
    </section>
  );
}

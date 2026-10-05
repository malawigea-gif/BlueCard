"use client";
import { useRef, useState } from "react";
import { RichText } from "@/components/RichText";
import { tidyText } from "@/lib/text";
import { useT } from "@/lib/i18n/client";

type Props = { name: string; label: string; defaultValue?: string; rows?: number; lang?: "en" | "de" };

/** Textarea with a small formatting toolbar and a live preview. Stores plain text with light marks. */
export function RichTextEditor({ name, label, defaultValue = "", rows = 12, lang }: Props) {
  const t = useT();
  const ref = useRef<HTMLTextAreaElement>(null);
  const [value, setValue] = useState(defaultValue);
  const [preview, setPreview] = useState(false);

  function apply(fn: (sel: string, before: string, after: string) => { text: string; selStart: number; selEnd: number }) {
    const el = ref.current;
    if (!el) return;
    const { selectionStart: s, selectionEnd: e, value: v } = el;
    const r = fn(v.slice(s, e), v.slice(0, s), v.slice(e));
    setValue(r.text);
    requestAnimationFrame(() => { el.focus(); el.setSelectionRange(r.selStart, r.selEnd); });
  }

  const wrap = (mark: string, placeholder: string) => apply((sel, before, after) => {
    const inner = sel || placeholder;
    return { text: before + mark + inner + mark + after, selStart: before.length + mark.length, selEnd: before.length + mark.length + inner.length };
  });

  const prefixLines = (make: (i: number) => string) => apply((sel, before, after) => {
    // extend to whole lines
    const lineStart = before.lastIndexOf("\n") + 1;
    const head = before.slice(0, lineStart);
    const block = before.slice(lineStart) + sel;
    const lines = (block || "").split("\n").map((l, i) => make(i) + l.replace(/^(#{1,3}\s+|[-*•]\s+|\d+[.)]\s+|>\s?)/, ""));
    const out = lines.join("\n");
    const needsGap = head && !head.endsWith("\n\n") ? "\n" : "";
    return { text: head + needsGap + out + after, selStart: head.length + needsGap.length, selEnd: head.length + needsGap.length + out.length };
  });


  const btn = "rounded px-2 py-1 text-sm text-slate-700 hover:bg-white hover:shadow-sm disabled:opacity-40";
  return (
    <div>
      <label className="label">{label}</label>
      <div className="overflow-hidden rounded-lg border border-slate-300 focus-within:border-navy-500 focus-within:ring-2 focus-within:ring-navy-100">
        <div className="flex flex-wrap items-center gap-0.5 border-b border-slate-200 bg-slate-50 px-1.5 py-1">
          <button type="button" className={`${btn} font-bold`} title={t("editor.bold")} onClick={() => wrap("**", t("editor.bold"))} disabled={preview}>B</button>
          <button type="button" className={`${btn} font-bold`} title={t("editor.heading")} onClick={() => prefixLines(() => "### ")} disabled={preview}>H</button>
          <button type="button" className={btn} title={t("editor.list")} onClick={() => prefixLines(() => "- ")} disabled={preview}>• ≡</button>
          <span className="mx-1 h-5 w-px bg-slate-200" />
          <button type="button" className={btn} onClick={() => setValue(tidyText(value))} disabled={preview}>✨ {t("editor.tidy")}</button>
          <button type="button" className={`${btn} ml-auto font-semibold text-navy-700`} onClick={() => setPreview((p) => !p)}>
            {preview ? `✎ ${t("editor.write")}` : `👁 ${t("editor.preview")}`}
          </button>
        </div>
        {preview ? (
          <div className="max-h-[32rem] min-h-40 overflow-y-auto bg-white px-5 py-4" lang={lang}>
            {value.trim() ? <RichText text={value} /> : <p className="text-sm text-slate-400">{t("editor.empty")}</p>}
          </div>
        ) : null}
        <textarea ref={ref} name={name} rows={rows} value={value} onChange={(e) => setValue(e.target.value)} lang={lang}
          className={`block w-full resize-y bg-white px-3 py-2 text-sm leading-7 outline-none ${preview ? "hidden" : ""}`} />
      </div>
      <p className="mt-1 text-xs text-slate-500">{t("editor.help")}</p>
    </div>
  );
}

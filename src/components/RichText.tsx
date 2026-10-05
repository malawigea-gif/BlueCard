import { Fragment, type ReactNode } from "react";

// Lightweight, safe Markdown renderer for Admin-entered text.
// Supports: # / ## / ### headings, **bold**, "* " or "- " bullet lists,
// a line that is entirely **bold** (shown as a sub-title), and lines ending with ":" (shown as a label).

type Block =
  | { t: "h"; level: number; text: string }
  | { t: "ul"; items: string[] }
  | { t: "sub"; text: string }
  | { t: "label"; text: string }
  | { t: "flow"; steps: string[] }
  | { t: "p"; text: string };

export function inline(text: string): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /\*\*(.+?)\*\*/g;
  let last = 0, m: RegExpExecArray | null, i = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    out.push(<strong key={i++} className="font-semibold text-navy-900">{m[1].trim()}</strong>);
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

export function parse(md: string): Block[] {
  const lines = md.replace(/\r\n?/g, "\n").split("\n");
  const blocks: Block[] = [];
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;
    const h = line.match(/^(#{1,6})\s+(.*)$/);
    const li = line.match(/^[*-]\s+(.*)$/);
    const sub = line.match(/^\*\*(.+?)\s*\*\*$/);
    if (h) blocks.push({ t: "h", level: h[1].length, text: h[2] });
    else if (li) {
      const prev = blocks[blocks.length - 1];
      if (prev?.t === "ul") prev.items.push(li[1]);
      else blocks.push({ t: "ul", items: [li[1]] });
    } else if (sub && sub[1].includes("→")) blocks.push({ t: "flow", steps: sub[1].split("→").map((s) => s.trim()).filter(Boolean) });
    else if (sub && !sub[1].includes("**")) blocks.push({ t: "sub", text: sub[1] });
    else if (line.endsWith(":") && line.length < 60) blocks.push({ t: "label", text: line });
    else blocks.push({ t: "p", text: line });
  }
  return blocks;
}

export function RichText({ text, className = "", justify = true }: { text: string; className?: string; justify?: boolean }) {
  const blocks = parse(text);
  return (
    <div className={`space-y-4 text-[15px] leading-7 text-slate-700 ${className}`}>
      {blocks.map((b, i) => (
        <Fragment key={i}>{renderBlock(b, justify)}</Fragment>
      ))}
    </div>
  );
}

function renderBlock(b: Block, justify: boolean) {
  switch (b.t) {
    case "h":
      return b.level <= 2
        ? <h3 className="pt-2 text-xl font-bold text-navy-800">{inline(b.text)}</h3>
        : <h4 className="pt-1 text-lg font-bold text-navy-800">{inline(b.text)}</h4>;
    case "sub":
      return <p className="font-semibold text-navy-800">{b.text}</p>;
    case "label":
      return <p className="!mb-1 font-semibold text-slate-800">{inline(b.text)}</p>;
    case "ul":
      return (
        <ul className="space-y-1.5">
          {b.items.map((it, j) => (
            <li key={j} className="flex gap-3 text-left">
              <span className="mt-[11px] h-1.5 w-1.5 shrink-0 rounded-full bg-gold-500" />
              <span>{inline(it)}</span>
            </li>
          ))}
        </ul>
      );
    case "flow":
      return (
        <ol className="flex flex-wrap items-center gap-2">
          {b.steps.map((s, j) => (
            <li key={j} className="flex items-center gap-2">
              <span className="rounded-full border border-navy-200 bg-white px-3 py-1 text-sm font-semibold text-navy-800">
                <span className="mr-1.5 text-gold-500">{j + 1}</span>{s}
              </span>
              {j < b.steps.length - 1 && <span className="text-navy-500">→</span>}
            </li>
          ))}
        </ol>
      );
    default:
      return <p className={justify ? "text-justify hyphens-auto" : "text-left"}>{inline(b.text)}</p>;
  }
}

// Splits Markdown into sections at headings ("#..." lines, or "1. Title" numbered lines).
export function splitSections(md: string) {
  const lines = md.replace(/\r\n?/g, "\n").split("\n");
  const sections: { title: string; level: number; num?: string; body: string }[] = [];
  let intro: string[] = [];
  let cur: { title: string; level: number; num?: string; lines: string[] } | null = null;
  const flush = () => { if (cur) sections.push({ title: cur.title, level: cur.level, num: cur.num, body: cur.lines.join("\n").trim() }); };
  for (const raw of lines) {
    const line = raw.trim();
    const h = line.match(/^(#{1,6})\s+(?:(\d+)\.\s*)?(.*)$/);
    const n = !h && line.match(/^(\d+)\.\s+(.{2,80})$/);
    if (h || n) {
      flush();
      cur = h
        ? { title: h[3], level: h[2] ? 3 : h[1].length, num: h[2], lines: [] }
        : { title: (n as RegExpMatchArray)[2], level: 3, num: (n as RegExpMatchArray)[1], lines: [] };
    } else if (cur) cur.lines.push(raw);
    else intro.push(raw);
  }
  flush();
  return { intro: intro.join("\n").trim(), sections };
}

// Plain-text version of Markdown (for short previews such as news cards).
export function plainText(md: string) {
  return md.replace(/\r\n?/g, "\n").replace(/^\s*#{1,6}\s+/gm, "").replace(/^\s*[*-]\s+/gm, "• ").replace(/\*\*/g, "").replace(/\s*\n\s*/g, " ").trim();
}

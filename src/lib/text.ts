// Text clean-up and a small, safe formatter for article / programme text.
//
// Writers type plain text. Supported marks:
//   empty line            → new paragraph
//   ## Heading / ### Sub  → headings
//   - item  /  1. item    → bullet / numbered lists
//   > text                → quote
//   **bold**  *italic*  [text](https://link)
// No HTML is ever passed through, so the output is always safe.

/** Normalises whitespace without touching words: trims lines, collapses repeated spaces and blank lines. */
export function tidyText(input: string): string {
  return input
    .replace(/\r\n?/g, "\n")
    .replace(/ /g, " ")
    .split("\n")
    .map((l) => {
      const m = l.match(/^(\s*)(.*)$/)!;
      // keep list indentation, collapse runs of spaces/tabs, drop spaces before punctuation
      const body = m[2].replace(/[ \t]+/g, " ").replace(/ +([,.;:!?)])/g, "$1").replace(/([,;])(?=\p{L})/gu, "$1 ").replace(/\( +/g, "(").trimEnd();
      return body;
    })
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** Single-line fields (titles, names). */
export function tidyLine(input: string): string {
  return input.replace(/\*\*/g, "").replace(/\s+/g, " ").replace(/ +([,.;:!?)])/g, "$1").trim();
}

/** Removes formatting marks — used for short previews such as article cards. */
export function plainText(input: string): string {
  return input
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/(^|[^*])\*(?!\s)(.+?)\*/g, "$1$2")
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, "$1")
    .replace(/^\s*(#{1,3}|>|[-*•]|\d+[.)])\s+/gm, "")
    .replace(/\s+/g, " ")
    .trim();
}

export type Inline = { t: "text" | "b" | "i"; v: string } | { t: "a"; v: string; href: string };
export type Block =
  | { k: "p"; lines: Inline[][] }
  | { k: "h2" | "h3"; text: Inline[] }
  | { k: "ul" | "ol"; items: Inline[][] }
  | { k: "quote"; lines: Inline[][] };

export function parseInline(s: string): Inline[] {
  const out: Inline[] = [];
  const re = /\*\*(.+?)\*\*|\*(?!\s)(.+?)\*|\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(s))) {
    if (m.index > last) out.push({ t: "text", v: s.slice(last, m.index) });
    if (m[1] !== undefined) out.push({ t: "b", v: m[1] });
    else if (m[2] !== undefined) out.push({ t: "i", v: m[2] });
    else out.push({ t: "a", v: m[3], href: m[4] });
    last = m.index + m[0].length;
  }
  if (last < s.length) out.push({ t: "text", v: s.slice(last) });
  return out;
}

const UL = /^\s*[-*•]\s+/;
const OL = /^\s*\d+[.)]\s+/;

export function parseBlocks(input: string): Block[] {
  const text = tidyText(input);
  if (!text) return [];
  // No blank lines at all? Then every line is its own paragraph.
  const chunks = text.includes("\n\n") ? text.split(/\n\n+/) : text.split("\n");
  const blocks: Block[] = [];
  for (const chunk of chunks) {
    const lines = chunk.split("\n").filter((l) => l.trim());
    if (!lines.length) continue;
    let i = 0;
    while (i < lines.length) {
      const line = lines[i];
      const h = line.match(/^(#{1,3})\s+(.*)$/);
      if (h) {
        blocks.push({ k: h[1].length === 3 ? "h3" : "h2", text: parseInline(h[2]) });
        i++;
        continue;
      }
      if (UL.test(line) || OL.test(line)) {
        const kind = UL.test(line) ? "ul" : "ol";
        const re = kind === "ul" ? UL : OL;
        const items: Inline[][] = [];
        while (i < lines.length && re.test(lines[i])) items.push(parseInline(lines[i++].replace(re, "")));
        blocks.push({ k: kind, items });
        continue;
      }
      if (line.startsWith(">")) {
        const q: Inline[][] = [];
        while (i < lines.length && lines[i].startsWith(">")) q.push(parseInline(lines[i++].replace(/^>\s?/, "")));
        blocks.push({ k: "quote", lines: q });
        continue;
      }
      const para: Inline[][] = [];
      while (i < lines.length && !/^#{1,3}\s/.test(lines[i]) && !UL.test(lines[i]) && !OL.test(lines[i]) && !lines[i].startsWith(">"))
        para.push(parseInline(lines[i++]));
      blocks.push({ k: "p", lines: para });
    }
  }
  return blocks;
}

// HTML emails sent to applicants (always in English). Built with tables and inline styles so they look right in every mail app.
import "server-only";
import { makeT } from "@/lib/i18n/dict";
import { STAGES, stageKey } from "@/lib/journey";
import { getSettings } from "@/lib/settings";

const NAVY = "#14306b", GOLD = "#e3b23c";
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const siteUrl = () => ((process.env.SITE_URL ?? "").trim() || "https://bluepathgermany.com").replace(/\/+$/, "");

/** Congratulation headline for reaching each step. */
const CONGRATS: Record<(typeof STAGES)[number], string> = {
  approved: "Your registration has been approved",
  assessment: "You have qualified for the eligibility assessment",
  documents: "You have passed the eligibility assessment",
  recognition: "Your documents are complete",
  jobs: "Your qualification has been recognised",
  offer: "You have received a job offer",
  visa: "You are ready to apply for your visa",
  arrival: "Your visa has been issued — welcome to Germany soon",
};

async function layout(o: { name: string; heading: string; paragraphs: string[]; box?: { title: string; text: string }; extra?: string }) {
  const s = await getSettings("en");
  const url = siteUrl();
  const p = o.paragraphs.map((x) => `<p style="margin:0 0 14px;font-size:15px;line-height:24px;color:#334155">${x}</p>`).join("");
  const box = o.box
    ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:6px 0 18px;background:#fff8e6;border-left:4px solid ${GOLD};border-radius:6px"><tr><td style="padding:14px 16px">
        <div style="font-size:13px;font-weight:bold;color:${NAVY};text-transform:uppercase;letter-spacing:.5px">${esc(o.box.title)}</div>
        <div style="margin-top:6px;font-size:14px;line-height:22px;color:#334155">${o.box.text}</div></td></tr></table>`
    : "";
  return `<!doctype html><html><body style="margin:0;padding:0;background:#f1f5f9;font-family:Arial,Helvetica,sans-serif">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:24px 12px"><tr><td align="center">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:10px;overflow:hidden">
<tr><td style="background:${NAVY};padding:22px 28px;color:#ffffff;font-size:20px;font-weight:bold">${esc(s.siteName)}<div style="height:3px;width:48px;background:${GOLD};margin-top:10px"></div></td></tr>
<tr><td style="padding:28px">
<h1 style="margin:0 0 18px;font-size:22px;line-height:30px;color:${NAVY}">${esc(o.heading)}</h1>
<p style="margin:0 0 14px;font-size:15px;line-height:24px;color:#334155">Dear ${esc(o.name)},</p>
${p}${box}${o.extra ?? ""}
<table role="presentation" cellpadding="0" cellspacing="0" style="margin:8px 0 22px"><tr><td style="background:${NAVY};border-radius:6px"><a href="${url}/profile" style="display:inline-block;padding:12px 22px;color:#ffffff;font-size:15px;font-weight:bold;text-decoration:none">Open my profile</a></td></tr></table>
<p style="margin:0;font-size:15px;line-height:24px;color:#334155">With best wishes,<br><strong>${esc(s.siteName)} team</strong></p>
</td></tr>
<tr><td style="background:#f8fafc;padding:16px 28px;font-size:12px;line-height:18px;color:#64748b;border-top:1px solid #e2e8f0">
This is an automated message sent from a no-reply address — please do not reply to this email.
If you have questions, please use the contact form at <a href="${url}/contact" style="color:${NAVY}">${esc(url.replace(/^https?:\/\//, ""))}/contact</a>.
</td></tr></table></td></tr></table></body></html>`;
}

const toText = (html: string) => html.replace(/<br\s*\/?>/g, "\n").replace(/<\/(p|h1|div|tr)>/g, "\n").replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/\n{3,}/g, "\n\n").trim();

/** Congratulation letter when an applicant reaches a step on the path to Germany (1–8). */
export async function stageEmail(o: { stage: number; name: string; cardNo?: string | null; note?: string | null }) {
  const t = makeT("en");
  const key = stageKey(o.stage);
  const title = t(`journey.${key}.title`);
  const subject = `Congratulations! Step ${o.stage} of ${STAGES.length}: ${title}`;
  const paragraphs = [
    `<strong>Congratulations!</strong> ${esc(CONGRATS[key])}. You have now reached <strong>step ${o.stage} of ${STAGES.length} – ${esc(title)}</strong> on your path to Germany.`,
    ...(o.stage === 1 && o.cardNo ? [`Your Blue Card member number is <strong>${esc(o.cardNo)}</strong>. Please keep it for all communication with us.`] : []),
    esc(t(`journey.${key}.desc`)),
  ];
  const extra = o.note?.trim()
    ? `<p style="margin:0 0 14px;font-size:14px;line-height:22px;color:#334155"><strong>Message from our office:</strong><br>${esc(o.note.trim()).replace(/\n/g, "<br>")}</p>`
    : "";
  const html = await layout({ name: o.name, heading: `Congratulations — ${title}`, paragraphs, box: { title: "What to do next", text: esc(t(`journey.${key}.todo`)) }, extra });
  return { subject, html, text: toText(html) };
}

/** Plain notification (application received, payment received, …) in the same design. */
export async function simpleEmail(o: { name: string; subject: string; message: string }) {
  const html = await layout({ name: o.name, heading: o.subject, paragraphs: [esc(o.message)] });
  return { subject: o.subject, html, text: toText(html) };
}

// Sends email through Resend (https://resend.com) — an HTTP API, so it works on Vercel.
// .env / Vercel:
//   RESEND_API_KEY   the API key from Resend (the sending domain must be verified there)
//   MAIL_FROM        sender, e.g. "Blue Path Way To Germany <noreply@bluepathgermany.com>"
// Without RESEND_API_KEY nothing is sent; the message is only written to the server log.
import "server-only";

const env = (k: string) => (process.env[k] ?? "").trim().replace(/^["']|["']$/g, "");

export function mailReady() {
  return !!env("RESEND_API_KEY");
}

export async function sendMail(m: { to: string; subject: string; html: string; text: string }) {
  const key = env("RESEND_API_KEY");
  if (!key) {
    console.log(`[mail] (not sent — RESEND_API_KEY missing) to=${m.to} | ${m.subject}`);
    return false;
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: env("MAIL_FROM") || "Blue Path Way To Germany <noreply@bluepathgermany.com>",
        to: [m.to],
        subject: m.subject,
        html: m.html,
        text: m.text,
        // no-reply: automatic message, replies are not read
        headers: { "Auto-Submitted": "auto-generated", "X-Auto-Response-Suppress": "All" },
      }),
      cache: "no-store",
    });
    if (!res.ok) {
      console.error(`[mail] failed (${res.status}) to=${m.to}: ${(await res.text()).slice(0, 300)}`);
      return false;
    }
    return true;
  } catch (e) {
    console.error(`[mail] error to=${m.to}: ${(e as Error).message}`);
    return false;
  }
}

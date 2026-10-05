import { getSettings } from "@/lib/settings";
import { getT } from "@/lib/i18n/server";
import { ContactForm } from "@/components/ContactForm";

export async function generateMetadata() {
  const { t } = await getT();
  return { title: t("nav.contact") };
}

function Row({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  if (!value) return null;
  return (
    <div className="flex gap-3">
      <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-navy-50 text-navy-600">{icon}</div>
      <div><div className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</div><div className="whitespace-pre-line text-slate-800">{value}</div></div>
    </div>
  );
}

export default async function Contact() {
  const { t, locale } = await getT();
  const s = await getSettings(locale);
  const ic = (d: string) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d={d} /></svg>;
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-bold text-navy-800">{t("nav.contact")}</h1>
      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <div className="card space-y-5 p-6">
          <Row label={t("contact.address")} value={s.address} icon={ic("M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11zM12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5")} />
          <Row label={t("contact.phone")} value={s.phone} icon={ic("M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z")} />
          <Row label={t("contact.email")} value={s.email} icon={ic("M4 4h16v16H4zM4 6l8 7 8-7")} />
          <Row label={t("contact.hours")} value={s.officeHours} icon={ic("M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 6v6l4 2")} />
          {s.mapEmbed && (
            <iframe src={s.mapEmbed} className="h-64 w-full rounded-lg border-0" loading="lazy" referrerPolicy="no-referrer-when-downgrade" title="map" />
          )}
        </div>
        <div className="card p-6">
          <h2 className="mb-4 text-xl font-bold text-navy-800">{t("contact.sendUs")}</h2>
          <ContactForm />
        </div>
      </div>
    </div>
  );
}

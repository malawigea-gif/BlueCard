import { getSettings } from "@/lib/settings";
import { getT } from "@/lib/i18n/server";
import { RichText, splitSections, inline } from "@/components/RichText";

export async function generateMetadata() {
  const { t } = await getT();
  return { title: t("nav.about") };
}

// Drops a leading "# About Us" / "# Über uns" heading, since the page already has that title.
function stripTitle(md: string) {
  return md.replace(/^\s*#\s+(about us|über uns)\s*(\r?\n)+/i, "");
}

// In each division, a plain first line (the team/role name) is shown bold.
function divisionBody(body: string) {
  const lines = body.split("\n");
  const i = lines.findIndex((l) => l.trim());
  if (i >= 0) {
    const l = lines[i].trim();
    if (!/^[*-]\s|^\*\*|:$/.test(l)) lines[i] = `**${l}**`;
  }
  return lines.join("\n");
}

export default async function About() {
  const { t, locale } = await getT();
  const s = await getSettings(locale);
  const structure = s.aboutStructure ? splitSections(s.aboutStructure) : null;
  const divisions = structure?.sections.filter((x) => x.level >= 3) ?? [];
  const others = structure?.sections.filter((x) => x.level < 3) ?? [];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-bold text-navy-800 md:text-4xl">{t("nav.about")}</h1>
      <div className="mt-2 h-1 w-16 rounded bg-gold-400" />

      {s.aboutIntro && (
        <section className="card mt-8 p-6 md:p-8">
          <RichText text={stripTitle(s.aboutIntro)} />
        </section>
      )}

      {(s.aboutVision || s.aboutMission) && (
        <div className="mt-10 grid items-start gap-6 lg:grid-cols-2">
          {s.aboutVision && (
            <section className="card border-t-4 border-t-navy-500 p-6 md:p-8">
              <h2 className="text-2xl font-bold text-navy-800">{t("about.vision")}</h2>
              <RichText text={s.aboutVision} className="mt-4" />
            </section>
          )}
          {s.aboutMission && (
            <section className="card border-t-4 border-t-gold-400 p-6 md:p-8">
              <h2 className="text-2xl font-bold text-navy-800">{t("about.mission")}</h2>
              <RichText text={s.aboutMission} className="mt-4" />
            </section>
          )}
        </div>
      )}

      {structure && (
        <section className="mt-12">
          <h2 className="text-2xl font-bold text-navy-800 md:text-3xl">{t("about.structure")}</h2>
          <div className="mt-2 h-1 w-16 rounded bg-gold-400" />
          {structure.intro && <RichText text={structure.intro} className="mt-5 max-w-4xl" />}

          {divisions.length > 0 && (
            <div className="mt-6 grid items-start gap-5 md:grid-cols-2 lg:grid-cols-3">
              {divisions.map((d, i) => (
                <article key={i} className="card h-full p-6">
                  <div className="flex items-start gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-navy-700 text-sm font-bold text-white">{d.num ?? i + 1}</span>
                    <h3 className="pt-1 text-lg font-bold leading-snug text-navy-800">{inline(d.title)}</h3>
                  </div>
                  {d.body && <RichText text={divisionBody(d.body)} justify={false} className="mt-4 !space-y-3 text-sm leading-6" />}
                </article>
              ))}
            </div>
          )}

          {others.map((o, i) => (
            <div key={i} className="mt-8 rounded-xl border border-navy-100 bg-navy-50 p-6 md:p-8">
              <h3 className="text-xl font-bold text-navy-800">{inline(o.title)}</h3>
              {o.body && <RichText text={o.body} className="mt-4" />}
            </div>
          ))}
        </section>
      )}
    </div>
  );
}

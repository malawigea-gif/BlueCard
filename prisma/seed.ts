// Initial data: the first Admin account and sample content (only when the database is empty)
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import { putFile } from "../src/lib/storage";

if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not set in .env");
const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

async function sampleImage(name: string, hue: number, label: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="hsl(${hue},60%,45%)"/><stop offset="1" stop-color="hsl(${hue + 30},65%,25%)"/></linearGradient></defs>
<rect width="800" height="600" fill="url(#g)"/><circle cx="640" cy="120" r="160" fill="#fff" opacity=".08"/><circle cx="120" cy="520" r="200" fill="#fff" opacity=".06"/>
<text x="400" y="310" text-anchor="middle" font-family="sans-serif" font-size="34" fill="#fff" opacity=".9">${label}</text></svg>`;
  await putFile(name, Buffer.from(svg), "image/svg+xml");
  return `/uploads/${name}`;
}

async function main() {
  const email = (process.env.ADMIN_EMAIL || "admin@bluecard.lk").toLowerCase();
  const password = process.env.ADMIN_PASSWORD || "Admin@123";
  if (!(await db.user.findUnique({ where: { email } }))) {
    await db.user.create({ data: { name: "System Admin", email, role: "ADMIN", passwordHash: await bcrypt.hash(password, 10) } });
    console.log(`✓ Admin account: ${email} / ${password}  (change the password after your first login)`);
  }

  if ((await db.setting.count()) === 0) {
    const s: Record<string, string> = {
      aboutIntro:
        "The **Blue Card Programme** promotes community welfare and cooperation. Members receive a personal Blue Card that gives them access to our services and benefits.\n\nThis is sample text — change it in the Admin panel under **About Us**.",
      aboutIntroDe:
        "Das **Blue Card-Programm** fördert das Gemeinwohl und die Zusammenarbeit in der Gemeinschaft. Mitglieder erhalten eine persönliche Blue Card, mit der sie unsere Leistungen und Vorteile nutzen können.\n\nDies ist ein Beispieltext – ändern Sie ihn im Verwaltungsbereich unter **Über uns**.",
      aboutVision: "Fair and easily accessible services for every citizen.",
      aboutVisionDe: "Faire und leicht zugängliche Leistungen für alle Bürgerinnen und Bürger.",
      aboutMission: "To deliver transparent, efficient and people-centred services through technology.",
      aboutMissionDe: "Transparente, effiziente und bürgernahe Leistungen mithilfe moderner Technik anzubieten.",
      aboutStructure: "Chairperson\nSecretary\nTreasurer\nProgramme Coordinator\nDistrict Representatives",
      aboutStructureDe: "Vorsitz\nSchriftführung\nSchatzmeisterei\nProgrammkoordination\nBezirksvertretungen",
    };
    for (const [key, value] of Object.entries(s)) await db.setting.create({ data: { key, value } });
  }

  if ((await db.article.count()) === 0) {
    const admin = await db.user.findUnique({ where: { email } });
    const items = [
      {
        title: "Online registration for the Blue Card Programme opens",
        titleDe: "Online-Registrierung für das Blue Card-Programm startet",
        summary: "You can now register for the Blue Card Programme from home — no office visit needed.",
        summaryDe: "Sie können sich ab sofort bequem von zu Hause aus für das Blue Card-Programm registrieren – ein Besuch im Büro ist nicht nötig.",
        body: "Registration for the Blue Card Programme has moved online. The new form takes only a few minutes to complete.\n\n## How it works\n\n1. Fill in the **registration form** with your personal and contact details.\n2. Upload a photo and a copy of your ID.\n3. An administrator reviews your application.\n4. Once approved, you receive your **Blue Card number** and can print your card.\n\nIf you have any questions, please contact our office.",
        bodyDe: "Die Registrierung für das Blue Card-Programm ist jetzt online möglich. Das neue Formular ist in wenigen Minuten ausgefüllt.\n\n## So funktioniert es\n\n1. Füllen Sie das **Registrierungsformular** mit Ihren persönlichen Angaben und Kontaktdaten aus.\n2. Laden Sie ein Foto und eine Kopie Ihres Ausweises hoch.\n3. Ein Administrator prüft Ihren Antrag.\n4. Nach der Freigabe erhalten Sie Ihre **Blue Card-Nummer** und können Ihre Karte ausdrucken.\n\nBei Fragen wenden Sie sich bitte an unser Büro.",
        hue: 210,
      },
      {
        title: "Awareness programmes in every district",
        titleDe: "Informationsveranstaltungen in allen Bezirken",
        summary: "From next month, awareness sessions will be held in all districts.",
        summaryDe: "Ab dem kommenden Monat finden in allen Bezirken Informationsveranstaltungen statt.",
        body: "Our team will visit every district to explain the programme and help people register.\n\nThe sessions cover:\n\n- the benefits of the Blue Card\n- how to register online\n- support for members who need help with the form\n\nDates and venues will be announced on this website.",
        bodyDe: "Unser Team besucht alle Bezirke, um das Programm vorzustellen und bei der Registrierung zu helfen.\n\nThemen der Veranstaltungen:\n\n- die Vorteile der Blue Card\n- die Online-Registrierung\n- Unterstützung für Mitglieder, die Hilfe beim Ausfüllen brauchen\n\nTermine und Orte werden auf dieser Webseite bekannt gegeben.",
        hue: 160,
      },
      {
        title: "Improved benefits for new members",
        titleDe: "Verbesserte Leistungen für neue Mitglieder",
        summary: "This year, the benefits for Blue Card holders will be extended.",
        summaryDe: "In diesem Jahr werden die Leistungen für Blue Card-Inhaberinnen und -Inhaber erweitert.",
        body: "We are pleased to announce that the benefits for Blue Card members will be extended this year.\n\n> Every member will be informed about the new benefits personally.\n\nThis is a sample article. You can edit or delete it in the Admin panel under **News**.",
        bodyDe: "Wir freuen uns, mitteilen zu können, dass die Leistungen für Blue Card-Mitglieder in diesem Jahr erweitert werden.\n\n> Alle Mitglieder werden persönlich über die neuen Leistungen informiert.\n\nDies ist ein Beispielartikel. Sie können ihn im Verwaltungsbereich unter **Neuigkeiten** bearbeiten oder löschen.",
        hue: 30,
      },
    ];
    for (const [i, { hue, ...a }] of items.entries()) {
      await db.article.create({
        data: {
          ...a, featured: true, authorId: admin?.id,
          slug: `sample-news-${i + 1}`,
          image: await sampleImage(`sample-news-${i + 1}.svg`, hue, `News ${i + 1}`),
          createdAt: new Date(Date.now() - i * 86400000 * 3),
        },
      });
    }
  }

  if ((await db.program.count()) === 0) {
    const ps = [
      ["Blue Card membership programme", "Blue Card-Mitgliedschaftsprogramm", "Special services and benefits for registered members.", "Besondere Leistungen und Vorteile für registrierte Mitglieder.", 215],
      ["Community development programme", "Programm für Gemeindeentwicklung", "Support for development projects at village level.", "Unterstützung für Entwicklungsprojekte auf Dorfebene.", 140],
      ["Education support programme", "Bildungsförderprogramm", "Scholarships and school equipment for members' children.", "Stipendien und Schulmaterial für die Kinder unserer Mitglieder.", 45],
    ] as const;
    for (const [i, [title, titleDe, summary, summaryDe, hue]] of ps.entries()) {
      await db.program.create({
        data: {
          title, titleDe, summary, summaryDe, sortOrder: i,
          body: "Sample description — change it in the Admin panel under **Our Programs**.",
          bodyDe: "Beispielbeschreibung – ändern Sie sie im Verwaltungsbereich unter **Unsere Programme**.",
          image: await sampleImage(`sample-program-${i + 1}.svg`, hue, title),
        },
      });
    }
  }

  if ((await db.galleryImage.count()) === 0) {
    for (let i = 0; i < 8; i++) {
      await db.galleryImage.create({ data: { url: await sampleImage(`sample-gallery-${i + 1}.svg`, (i * 45) % 360, `Photo ${i + 1}`), caption: `Sample photo ${i + 1}`, captionDe: `Beispielfoto ${i + 1}`, sortOrder: i } });
    }
  }

  if ((await db.partner.count()) === 0) {
    await db.partner.createMany({ data: [
      { name: "Sample organisation 1", description: "A short description of the partner organisation", descriptionDe: "Eine kurze Beschreibung der Partnerorganisation", sortOrder: 1 },
      { name: "Sample organisation 2", description: "A short description of the partner organisation", descriptionDe: "Eine kurze Beschreibung der Partnerorganisation", sortOrder: 2 },
    ] });
  }
  console.log("✓ Seed complete");
}

main().finally(() => db.$disconnect());

// Legal pages required by the payment gateway: Privacy Policy, Refund & Cancellation Policy, Terms & Conditions.
// The standard texts below are shown until an administrator saves their own version in Admin › Policies.
// Placeholders in {{double braces}} are filled in from Settings and the fee list, in the standard texts and in edited ones.
import type { Locale } from "@/lib/i18n/dict";
import type { DictKey } from "@/lib/i18n/dict";
import { getSettings, type Settings } from "@/lib/settings";
import { FEES, JOB_FEE_INTERVIEWS, JOB_FEE_VALID_DAYS, fmtMoney } from "@/lib/payments/config";
import { MAX_ATTEMPTS } from "@/lib/assessment/config";

export const POLICIES = {
  privacy: { path: "/privacy", key: "policyPrivacy", title: "policy.privacy" },
  refund: { path: "/refund-policy", key: "policyRefund", title: "policy.refund" },
  terms: { path: "/terms", key: "policyTerms", title: "policy.terms" },
} as const satisfies Record<string, { path: string; key: keyof Settings; title: DictKey }>;
export type PolicyId = keyof typeof POLICIES;
export const POLICY_IDS = Object.keys(POLICIES) as PolicyId[];

const EFFECTIVE = { en: "5 October 2026", de: "5. Oktober 2026" };

const EN: Record<PolicyId, string> = {
  privacy: `Effective date: {{effective}}

This Privacy Policy explains how **{{siteName}}** ({{website}}) collects, uses and protects your personal information when you use this website and our services.

## 1. Information we collect
* Account details: name, email address, phone number and password (stored only in encrypted form).
* Registration details: full name, NIC / passport number, date of birth, gender, address, country, occupation, photograph and copies of identity and qualification documents you upload.
* Assessment results: your answers and scores in the online eligibility test.
* Payment records: the fee paid, amount, date, order number and payment status. **Card details are entered on the secure PayHere payment page and are never received or stored by us.**
* Messages you send us through the contact form or by email.

## 2. How we use your information
* To register you, verify your identity and assess your eligibility for the programme.
* To prepare your applications for qualification recognition, job matching, interviews and visa.
* To process payments and keep accounting records.
* To contact you about your application, appointments and changes to our services.
* To meet legal and regulatory obligations.

## 3. Sharing your information
We share only what is needed for your application with:
* Prospective employers and recruitment partners in Germany (with your consent for each application).
* Authorities responsible for qualification recognition, the German embassy / consulate and other government bodies.
* PayHere (Pvt) Ltd, which processes card payments.
* Our technology providers, who host the website and database (Vercel and Supabase).
We do not sell your personal information.

## 4. Storage and security
Your data is stored on secure cloud servers. Passwords are encrypted, private documents and photos are visible only to you and authorised staff, and all connections use HTTPS. No system is completely secure, but we take reasonable steps to protect your information.

## 5. How long we keep information
We keep your information while your account is active and for up to 5 years afterwards, or longer when the law requires it (for example, payment and accounting records).

## 6. Your rights
You may ask us to show, correct or delete your personal information, or to stop using it for a particular purpose. Some information may have to be kept for legal reasons. Send your request to {{email}}.

## 7. Cookies
We use only the cookies needed for the website to work: one that keeps you signed in and one that remembers your language. We do not use advertising or tracking cookies.

## 8. Changes to this policy
We may update this policy. The current version is always published on this page with its effective date.

## 9. Contact
**{{siteName}}**
{{address}}
Phone: {{phone}}
Email: {{email}}

{{paymentOffice}}`,

  refund: `Effective date: {{effective}}

This policy explains when the fees paid for **{{siteName}}** ({{website}}) can be cancelled and refunded.

## 1. Our fees
* **Job matching & interviews fee – {{jobFee}}.** Paid after your qualification has been recognised. Valid for {{jobDays}} days or {{jobInterviews}} interviews, whichever comes first.
* **Visa & service fee – {{visaFee}}.** Paid before we start preparing your visa application.
These are service fees for our work. Fees charged by embassies, recognition authorities, translators or other third parties are paid separately and are not covered by this policy.

## 2. Job matching & interviews fee
* **Full refund** if you cancel within 60 days of payment and no interview has been arranged for you.
* **No refund** after the first interview has been arranged, or after 60 days from payment.
* No refund for unused time or interviews when the fee expires.

## 3. Visa & service fee
* **Full refund** if you cancel within 60 days of payment and we have not yet started preparing your visa documents.
* **50% refund** if you cancel after we have started preparing your documents but before an embassy appointment has been booked.
* **No refund** after the embassy appointment has been booked or the application has been submitted.
* The decision on a visa is made by the embassy alone. A refused visa does not entitle you to a refund of the service fee.

## 4. Payments made in error
Duplicate payments and payments charged because of a technical error are refunded in full.

## 5. How to request a cancellation or refund
Email {{email}} or call {{phone}} with your name, NIC / passport number and the **order number** shown on your payment receipt. We will reply within 5 working days.

## 6. How refunds are paid
Approved refunds are returned to the card or account used for the original payment through PayHere, normally within 14 working days. Payments made in a foreign currency are refunded in the same currency; the amount you receive may differ slightly because of your bank's exchange rate and charges.

## 7. Cancelling your registration
You may cancel your registration at any time by contacting us. Refunds for fees already paid follow the rules above.

## 8. Contact
**{{siteName}}**
{{address}}
Phone: {{phone}}
Email: {{email}}

{{paymentOffice}}`,

  terms: `Effective date: {{effective}}

These Terms & Conditions apply to the use of **{{siteName}}** ({{website}}) and the services we provide. By creating an account, registering or making a payment you agree to them.

## 1. Our services
We guide applicants from Sri Lanka on the way to employment in Germany under the EU Blue Card scheme: registration, an eligibility assessment, support with qualification recognition, job matching and interviews with employers, and help with preparing the visa application.

## 2. No guarantee
We do our best for every applicant, but **we do not guarantee** recognition of qualifications, a job offer, an employment contract or a visa. These decisions are made by employers, recognition authorities and the German embassy.

## 3. Your account and information
* You must be at least 18 years old.
* The information and documents you provide must be true, complete and your own. False information or documents may lead to cancellation of your registration without refund.
* Keep your password secret. You are responsible for activity on your account.

## 4. Eligibility assessment
The online test has a time limit and each question can be answered only once. Each applicant has up to {{attempts}} attempts. Attempts may not be taken by another person or with outside help.

## 5. Fees and payment
* The fees are shown on the website before you pay: job matching & interviews fee {{jobFee}} and visa & service fee {{visaFee}}.
* Online payments are processed securely by PayHere. We never receive your card details.
* A fee is due only when you reach the step it belongs to. Cancellations and refunds follow our Refund & Cancellation Policy.

## 6. Acceptable use
Do not misuse the website, try to access other people's information, upload harmful files or interfere with its operation.

## 7. Content
Text, images and the design of this website belong to {{siteName}} or its partners and may not be copied without permission.

## 8. Limitation of liability
To the extent permitted by law, we are not liable for indirect losses or for decisions made by employers, authorities or embassies. Our total liability for any claim is limited to the fees you have paid to us.

## 9. Ending the service
You may end your registration at any time. We may suspend or end an account that breaks these terms.

## 10. Changes
We may update these terms. The current version is always published on this page.

## 11. Governing law
These terms are governed by the laws of Sri Lanka. Disputes are subject to the courts of Sri Lanka.

## 12. Contact
**{{siteName}}**
{{address}}
Phone: {{phone}}
Email: {{email}}

{{paymentOffice}}`,
};

const DE: Record<PolicyId, string> = {
  privacy: `Gültig ab: {{effective}}

Diese Datenschutzerklärung erläutert, wie **{{siteName}}** ({{website}}) Ihre personenbezogenen Daten bei der Nutzung dieser Website und unserer Dienste erhebt, verwendet und schützt.

## 1. Welche Daten wir erheben
* Kontodaten: Name, E-Mail-Adresse, Telefonnummer und Passwort (nur verschlüsselt gespeichert).
* Registrierungsdaten: vollständiger Name, NIC- / Reisepassnummer, Geburtsdatum, Geschlecht, Anschrift, Land, Beruf, Foto sowie Kopien der von Ihnen hochgeladenen Ausweis- und Qualifikationsnachweise.
* Testergebnisse: Ihre Antworten und Punktzahlen im Online-Eignungstest.
* Zahlungsdaten: bezahlte Gebühr, Betrag, Datum, Bestellnummer und Zahlungsstatus. **Kartendaten geben Sie auf der sicheren Zahlungsseite von PayHere ein; wir erhalten oder speichern sie nie.**
* Nachrichten, die Sie uns über das Kontaktformular oder per E-Mail senden.

## 2. Wofür wir Ihre Daten verwenden
* Für Ihre Registrierung, die Prüfung Ihrer Identität und Ihrer Eignung für das Programm.
* Für die Vorbereitung Ihrer Anträge auf Anerkennung, Stellenvermittlung, Vorstellungsgespräche und Visum.
* Für die Abwicklung von Zahlungen und die Buchhaltung.
* Um Sie über Ihre Bewerbung, Termine und Änderungen unserer Dienste zu informieren.
* Zur Erfüllung gesetzlicher Pflichten.

## 3. Weitergabe von Daten
Wir geben nur die für Ihre Bewerbung nötigen Daten weiter an:
* Potenzielle Arbeitgeber und Vermittlungspartner in Deutschland (mit Ihrer Zustimmung für jede Bewerbung).
* Anerkennungsstellen, die deutsche Botschaft / das Konsulat und andere Behörden.
* PayHere (Pvt) Ltd, das Kartenzahlungen abwickelt.
* Unsere Technikdienstleister, die Website und Datenbank betreiben (Vercel und Supabase).
Wir verkaufen Ihre Daten nicht.

## 4. Speicherung und Sicherheit
Ihre Daten werden auf sicheren Cloud-Servern gespeichert. Passwörter sind verschlüsselt, private Dokumente und Fotos sind nur für Sie und berechtigte Mitarbeiter sichtbar, und alle Verbindungen nutzen HTTPS. Kein System ist völlig sicher, doch wir treffen angemessene Maßnahmen zum Schutz Ihrer Daten.

## 5. Speicherdauer
Wir speichern Ihre Daten, solange Ihr Konto besteht, und bis zu 5 Jahre danach, oder länger, wenn das Gesetz es verlangt (z. B. Zahlungs- und Buchhaltungsunterlagen).

## 6. Ihre Rechte
Sie können Auskunft, Berichtigung oder Löschung Ihrer Daten verlangen oder einer bestimmten Verwendung widersprechen. Manche Daten müssen aus rechtlichen Gründen aufbewahrt werden. Senden Sie Ihre Anfrage an {{email}}.

## 7. Cookies
Wir verwenden nur technisch notwendige Cookies: eines, das Sie angemeldet hält, und eines, das Ihre Sprache speichert. Wir verwenden keine Werbe- oder Tracking-Cookies.

## 8. Änderungen
Wir können diese Erklärung aktualisieren. Die aktuelle Fassung wird stets mit ihrem Gültigkeitsdatum auf dieser Seite veröffentlicht.

## 9. Kontakt
**{{siteName}}**
{{address}}
Telefon: {{phone}}
E-Mail: {{email}}

{{paymentOffice}}`,

  refund: `Gültig ab: {{effective}}

Diese Richtlinie erläutert, wann für **{{siteName}}** ({{website}}) gezahlte Gebühren storniert und erstattet werden können.

## 1. Unsere Gebühren
* **Vermittlungs- & Vorstellungsgebühr – {{jobFee}}.** Zahlbar nach der Anerkennung Ihrer Qualifikation. Gültig für {{jobDays}} Tage oder {{jobInterviews}} Vorstellungsgespräche, je nachdem, was zuerst eintritt.
* **Visa- & Servicegebühr – {{visaFee}}.** Zahlbar, bevor wir mit der Vorbereitung Ihres Visumantrags beginnen.
Dies sind Servicegebühren für unsere Arbeit. Gebühren von Botschaften, Anerkennungsstellen, Übersetzern oder anderen Dritten werden gesondert bezahlt und fallen nicht unter diese Richtlinie.

## 2. Vermittlungs- & Vorstellungsgebühr
* **Volle Erstattung** bei Stornierung innerhalb von 60 Tagen nach Zahlung, sofern noch kein Vorstellungsgespräch vereinbart wurde.
* **Keine Erstattung**, sobald das erste Vorstellungsgespräch vereinbart ist, oder nach Ablauf von 60 Tagen.
* Keine Erstattung für nicht genutzte Zeit oder Gespräche nach Ablauf der Gültigkeit.

## 3. Visa- & Servicegebühr
* **Volle Erstattung** bei Stornierung innerhalb von 60 Tagen nach Zahlung, sofern wir noch nicht mit der Vorbereitung Ihrer Visumunterlagen begonnen haben.
* **50 % Erstattung** bei Stornierung, nachdem wir mit der Vorbereitung begonnen haben, aber bevor ein Botschaftstermin gebucht wurde.
* **Keine Erstattung**, nachdem der Botschaftstermin gebucht oder der Antrag eingereicht wurde.
* Über das Visum entscheidet allein die Botschaft. Eine Ablehnung begründet keinen Anspruch auf Erstattung der Servicegebühr.

## 4. Irrtümliche Zahlungen
Doppelte Zahlungen und Belastungen aufgrund eines technischen Fehlers werden vollständig erstattet.

## 5. Stornierung oder Erstattung beantragen
Schreiben Sie an {{email}} oder rufen Sie {{phone}} an und nennen Sie Ihren Namen, Ihre NIC- / Reisepassnummer und die **Bestellnummer** auf Ihrem Zahlungsbeleg. Wir antworten innerhalb von 5 Werktagen.

## 6. Auszahlung von Erstattungen
Genehmigte Erstattungen werden über PayHere auf die Karte bzw. das Konto der ursprünglichen Zahlung zurückgezahlt, in der Regel innerhalb von 14 Werktagen. Zahlungen in Fremdwährung werden in derselben Währung erstattet; durch Wechselkurse und Gebühren Ihrer Bank kann der erhaltene Betrag leicht abweichen.

## 7. Kündigung der Registrierung
Sie können Ihre Registrierung jederzeit kündigen, indem Sie uns kontaktieren. Für bereits gezahlte Gebühren gelten die obigen Regeln.

## 8. Kontakt
**{{siteName}}**
{{address}}
Telefon: {{phone}}
E-Mail: {{email}}

{{paymentOffice}}`,

  terms: `Gültig ab: {{effective}}

Diese Allgemeinen Geschäftsbedingungen gelten für die Nutzung von **{{siteName}}** ({{website}}) und unsere Leistungen. Mit dem Anlegen eines Kontos, der Registrierung oder einer Zahlung stimmen Sie ihnen zu.

## 1. Unsere Leistungen
Wir begleiten Bewerberinnen und Bewerber aus Sri Lanka auf dem Weg zu einer Beschäftigung in Deutschland mit der EU Blue Card: Registrierung, Eignungstest, Unterstützung bei der Anerkennung von Qualifikationen, Stellenvermittlung und Vorstellungsgespräche sowie Hilfe bei der Vorbereitung des Visumantrags.

## 2. Keine Garantie
Wir setzen uns für jede Bewerbung ein, **garantieren jedoch nicht** die Anerkennung von Qualifikationen, ein Stellenangebot, einen Arbeitsvertrag oder ein Visum. Darüber entscheiden Arbeitgeber, Anerkennungsstellen und die deutsche Botschaft.

## 3. Ihr Konto und Ihre Angaben
* Sie müssen mindestens 18 Jahre alt sein.
* Ihre Angaben und Dokumente müssen wahr, vollständig und Ihre eigenen sein. Falsche Angaben oder Dokumente können zur Stornierung der Registrierung ohne Erstattung führen.
* Halten Sie Ihr Passwort geheim. Sie sind für Aktivitäten in Ihrem Konto verantwortlich.

## 4. Eignungstest
Der Online-Test ist zeitlich begrenzt, und jede Frage kann nur einmal beantwortet werden. Jede Person hat bis zu {{attempts}} Versuche. Versuche dürfen nicht von anderen Personen oder mit fremder Hilfe abgelegt werden.

## 5. Gebühren und Zahlung
* Die Gebühren werden vor der Zahlung auf der Website angezeigt: Vermittlungs- & Vorstellungsgebühr {{jobFee}} und Visa- & Servicegebühr {{visaFee}}.
* Online-Zahlungen werden sicher über PayHere abgewickelt. Wir erhalten Ihre Kartendaten nie.
* Eine Gebühr wird erst fällig, wenn Sie den zugehörigen Schritt erreichen. Für Stornierungen und Erstattungen gilt unsere Rückerstattungs- & Stornierungsrichtlinie.

## 6. Zulässige Nutzung
Missbrauchen Sie die Website nicht, versuchen Sie nicht, auf Daten anderer zuzugreifen, laden Sie keine schädlichen Dateien hoch und stören Sie den Betrieb nicht.

## 7. Inhalte
Texte, Bilder und Gestaltung dieser Website gehören {{siteName}} oder seinen Partnern und dürfen nicht ohne Erlaubnis kopiert werden.

## 8. Haftungsbeschränkung
Soweit gesetzlich zulässig, haften wir nicht für mittelbare Schäden oder für Entscheidungen von Arbeitgebern, Behörden oder Botschaften. Unsere Gesamthaftung ist auf die an uns gezahlten Gebühren begrenzt.

## 9. Beendigung
Sie können Ihre Registrierung jederzeit beenden. Wir können ein Konto sperren oder schließen, das gegen diese Bedingungen verstößt.

## 10. Änderungen
Wir können diese Bedingungen aktualisieren. Die aktuelle Fassung wird stets auf dieser Seite veröffentlicht.

## 11. Anwendbares Recht
Es gilt das Recht Sri Lankas. Gerichtsstand sind die Gerichte Sri Lankas.

## 12. Kontakt
**{{siteName}}**
{{address}}
Telefon: {{phone}}
E-Mail: {{email}}

{{paymentOffice}}`,
};

export const DEFAULT_POLICIES: Record<"en" | "de", Record<PolicyId, string>> = { en: EN, de: DE };

/** The text of a policy for display: the administrator's version if saved, otherwise the standard text — placeholders filled in. */
export async function getPolicy(id: PolicyId, locale: Locale) {
  const s = await getSettings(locale);
  const custom = (s[POLICIES[id].key] ?? "").trim();
  const text = custom || DEFAULT_POLICIES[locale][id];
  const site = (process.env.SITE_URL ?? "").trim().replace(/^https?:\/\//, "").replace(/\/+$/, "");
  const vars: Record<string, string> = {
    siteName: s.siteName,
    legalName: s.legalName || s.siteName,
    website: site || s.siteName,
    address: s.address,
    phone: s.phone,
    email: s.email,
    effective: EFFECTIVE[locale],
    jobFee: fmtMoney(FEES.JOB_MATCHING.cents, FEES.JOB_MATCHING.currency, locale),
    visaFee: fmtMoney(FEES.VISA.cents, FEES.VISA.currency, locale),
    jobDays: String(JOB_FEE_VALID_DAYS),
    jobInterviews: String(JOB_FEE_INTERVIEWS),
    attempts: String(MAX_ATTEMPTS),
    paymentOffice: s.paymentOfficeAddress.trim()
      ? [locale === "de" ? "**Büro Sri Lanka (Zahlungen)**" : "**Sri Lanka office (payments)**", s.paymentOfficeAddress.trim(),
         s.paymentOfficePhone.trim() ? `${locale === "de" ? "Telefon" : "Phone"}: ${s.paymentOfficePhone.trim()}` : ""].filter(Boolean).join("\n")
      : "",
  };
  return text.replace(/\{\{\s*(\w+)\s*\}\}/g, (m, k: string) => vars[k] ?? m);
}

import type { Metadata } from "next";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";
import "@fontsource/inter/800.css";
import "@fontsource/inter/400-italic.css";
import "./globals.css";
import { getSettings } from "@/lib/settings";
import { getLocale } from "@/lib/i18n/server";
import { I18nProvider } from "@/lib/i18n/client";
import { ImageShrinker } from "@/components/ImageShrinker";

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings(await getLocale());
  return { title: { default: s.siteName, template: `%s | ${s.siteName}` }, description: s.siteTagline };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  return (
    <html lang={locale}>
      <body className="min-h-screen">
        <I18nProvider locale={locale}>{children}</I18nProvider>
        <ImageShrinker />
      </body>
    </html>
  );
}

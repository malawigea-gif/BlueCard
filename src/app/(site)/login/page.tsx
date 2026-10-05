import Link from "next/link";
import { LoginForm } from "@/components/LoginForm";
import { getT } from "@/lib/i18n/server";

export async function generateMetadata() {
  const { t } = await getT();
  return { title: t("login.title") };
}

export default async function Login({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const [{ next }, { t }] = await Promise.all([searchParams, getT()]);
  return (
    <div className="mx-auto max-w-md px-4 py-14">
      <div className="card p-8">
        <h1 className="text-2xl font-bold text-navy-800">{t("login.title")}</h1>
        <p className="mt-1 text-sm text-slate-500">{t("login.sub")}</p>
        <div className="mt-6"><LoginForm next={next} /></div>
        <p className="mt-6 text-center text-sm text-slate-600">
          {t("login.notRegistered")} <Link href="/register" className="font-semibold text-navy-600 hover:underline">{t("home.ctaButton")}</Link>
        </p>
        <p className="mt-2 text-center text-xs text-slate-400">{t("login.forgot")}</p>
      </div>
    </div>
  );
}

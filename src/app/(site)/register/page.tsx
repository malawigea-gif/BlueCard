import { redirect } from "next/navigation";
import { RegisterForm } from "@/components/RegisterForm";
import { getSession } from "@/lib/auth";
import { getT } from "@/lib/i18n/server";
import { getCountries } from "@/lib/geo";

export async function generateMetadata() {
  const { t } = await getT();
  return { title: t("register.title") };
}

export default async function Register() {
  const s = await getSession();
  if (s) redirect(s.role === "ADMIN" ? "/admin" : "/profile");
  const { t, locale } = await getT();
  const steps = [t("register.step1"), t("register.step2"), t("register.step3"), t("register.step4")];
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold text-navy-800">{t("register.title")}</h1>
      <p className="mt-2 text-slate-600">{t("register.sub")}</p>
      <ol className="mt-6 grid gap-2 sm:grid-cols-4">
        {steps.map((s, i) => (
          <li key={i} className="rounded-lg bg-navy-50 px-3 py-2 text-xs leading-5 text-navy-800">
            <span className="font-bold">{i + 1}. </span>{s}
          </li>
        ))}
      </ol>
      <div className="mt-8"><RegisterForm countries={getCountries(locale)} /></div>
    </div>
  );
}

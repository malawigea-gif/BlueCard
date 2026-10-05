import Link from "next/link";
import { getT } from "@/lib/i18n/server";

export default async function NotFound() {
  const { t } = await getT();
  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <div className="text-6xl font-bold text-navy-200">404</div>
      <h1 className="mt-2 text-xl font-bold text-navy-800">{t("notFound.title")}</h1>
      <Link href="/" className="btn-primary mt-6">{t("notFound.home")}</Link>
    </div>
  );
}

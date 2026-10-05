import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { ProgramForm } from "@/components/admin/ProgramForm";
import { PageTitle } from "@/components/admin/PageTitle";
import { Flash, type SP } from "@/components/admin/Flash";
import { getT } from "@/lib/i18n/server";

export default async function EditProgram({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: SP }) {
  const p = await db.program.findUnique({ where: { id: Number((await params).id) } });
  if (!p) notFound();
  const { t } = await getT();
  return (<><PageTitle title={t("aprog.editTitle")} /><Flash searchParams={searchParams} /><ProgramForm p={p} /></>);
}

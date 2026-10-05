import { ProgramForm } from "@/components/admin/ProgramForm";
import { PageTitle } from "@/components/admin/PageTitle";
import { Flash, type SP } from "@/components/admin/Flash";
import { getT } from "@/lib/i18n/server";

export default async function NewProgram({ searchParams }: { searchParams: SP }) {
  const { t } = await getT();
  return (<><PageTitle title={t("aprog.newTitle")} /><Flash searchParams={searchParams} /><ProgramForm /></>);
}

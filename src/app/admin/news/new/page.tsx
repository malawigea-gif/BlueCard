import { ArticleForm } from "@/components/admin/ArticleForm";
import { PageTitle } from "@/components/admin/PageTitle";
import { Flash, type SP } from "@/components/admin/Flash";
import { getT } from "@/lib/i18n/server";

export default async function NewArticle({ searchParams }: { searchParams: SP }) {
  const { t } = await getT();
  return (<><PageTitle title={t("anews.newTitle")} /><Flash searchParams={searchParams} /><ArticleForm /></>);
}

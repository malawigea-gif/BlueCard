import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { ArticleForm } from "@/components/admin/ArticleForm";
import { PageTitle } from "@/components/admin/PageTitle";
import { Flash, type SP } from "@/components/admin/Flash";
import { getT } from "@/lib/i18n/server";

export default async function EditArticle({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: SP }) {
  const a = await db.article.findUnique({ where: { id: Number((await params).id) } });
  if (!a) notFound();
  const { t } = await getT();
  return (<><PageTitle title={t("anews.editTitle")} /><Flash searchParams={searchParams} /><ArticleForm a={a} /></>);
}

import { db } from "@/lib/db";
import { toggleMessage, deleteMessage } from "@/app/actions/admin";
import { PageTitle } from "@/components/admin/PageTitle";
import { Flash, type SP } from "@/components/admin/Flash";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { getT } from "@/lib/i18n/server";

export default async function Messages({ searchParams }: { searchParams: SP }) {
  const { t } = await getT();
  const items = await db.contactMessage.findMany({ orderBy: { createdAt: "desc" } });
  return (
    <>
      <PageTitle title={t("admin.nav.messages")} sub={t("amsg.sub")} />
      <Flash searchParams={searchParams} />
      <div className="space-y-3">
        {items.map((m) => (
          <div key={m.id} className={`card p-5 ${m.isRead ? "" : "border-l-4 border-l-gold-400"}`}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="font-bold text-slate-900">{m.subject || t("amsg.noSubject")}</div>
                <div className="text-sm text-slate-500">{m.name}{m.phone ? ` · ${m.phone}` : ""}{m.email ? ` · ${m.email}` : ""} · {m.createdAt.toISOString().slice(0, 16).replace("T", " ")}</div>
              </div>
              <div className="flex gap-2">
                <form action={toggleMessage}><input type="hidden" name="id" value={m.id} /><button className="btn-outline py-1">{m.isRead ? t("amsg.markUnread") : t("amsg.markRead")}</button></form>
                <form action={deleteMessage}><input type="hidden" name="id" value={m.id} /><ConfirmButton className="btn-outline py-1 text-red-600">{t("common.delete")}</ConfirmButton></form>
              </div>
            </div>
            <p className="prose-si mt-3 text-sm">{m.message}</p>
          </div>
        ))}
        {!items.length && <p className="text-sm text-slate-500">{t("amsg.empty")}</p>}
      </div>
    </>
  );
}

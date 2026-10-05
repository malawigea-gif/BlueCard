import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { createAdmin, resetPassword, toggleUser, deleteAdmin } from "@/app/actions/admin";
import { PageTitle } from "@/components/admin/PageTitle";
import { Flash, type SP } from "@/components/admin/Flash";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { getT } from "@/lib/i18n/server";

export default async function Users({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const me = await getSession();
  const { t } = await getT();
  const q = sp.q?.trim();
  const [admins, members] = await Promise.all([
    db.user.findMany({ where: { role: "ADMIN" }, orderBy: { createdAt: "asc" } }),
    db.user.findMany({ where: { role: "USER", ...(q ? { OR: [{ name: { contains: q, mode: "insensitive" as const } }, { email: { contains: q, mode: "insensitive" as const } }] } : {}) }, include: { registration: true }, orderBy: { createdAt: "desc" }, take: 200 }),
  ]);
  return (
    <>
      <PageTitle title={t("admin.nav.users")} sub={t("ausers.sub")} />
      <Flash searchParams={searchParams} />

      <h2 className="mb-3 text-lg font-bold text-navy-900">{t("ausers.admins")}</h2>
      <div className="card divide-y divide-slate-100">
        {admins.map((u) => (
          <div key={u.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3">
            <div><div className="font-medium text-slate-900">{u.name} {u.id === me?.uid && <span className="text-xs text-slate-400">{t("ausers.you")}</span>}</div><div className="text-sm text-slate-500">{u.email}</div></div>
            <div className="flex flex-wrap items-center gap-2">
              <form action={resetPassword} className="flex gap-2"><input type="hidden" name="id" value={u.id} /><input name="password" type="password" placeholder={t("ausers.newPassword")} minLength={8} className="input w-40 py-1.5" autoComplete="new-password" required /><button className="btn-outline py-1.5">{t("ausers.reset")}</button></form>
              {u.id !== me?.uid && <form action={deleteAdmin}><input type="hidden" name="id" value={u.id} /><ConfirmButton className="btn-outline py-1.5 text-red-600" message={t("ausers.deleteConfirm")}>{t("common.delete")}</ConfirmButton></form>}
            </div>
          </div>
        ))}
      </div>
      <form action={createAdmin} className="card mt-3 grid gap-3 border-dashed p-4 md:grid-cols-[1fr_1fr_1fr_auto] md:items-end">
        <div><label className="label">{t("ausers.name")}</label><input name="name" className="input" required /></div>
        <div><label className="label">{t("ausers.email")}</label><input name="email" type="email" className="input" required /></div>
        <div><label className="label">{t("ausers.password")}</label><input name="password" type="password" minLength={8} className="input" autoComplete="new-password" required /></div>
        <button className="btn-primary">{t("ausers.addAdmin")}</button>
      </form>

      <div className="mb-3 mt-10 flex flex-wrap items-end justify-between gap-3">
        <h2 className="text-lg font-bold text-navy-900">{t("ausers.members")}</h2>
        <form className="flex gap-2"><input name="q" defaultValue={q} placeholder={t("ausers.searchPh")} className="input w-56" /><button className="btn-outline">{t("common.search")}</button></form>
      </div>
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-600"><tr><th className="px-4 py-3">{t("ausers.colName")}</th><th className="px-4 py-3">{t("ausers.colEmail")}</th><th className="px-4 py-3">{t("ausers.colCard")}</th><th className="px-4 py-3">{t("ausers.colAccount")}</th><th className="px-4 py-3">{t("ausers.colReset")}</th></tr></thead>
          <tbody className="divide-y divide-slate-100">
            {members.map((u) => (
              <tr key={u.id}>
                <td className="px-4 py-3 font-medium">{u.name}</td>
                <td className="px-4 py-3 text-slate-600">{u.email}</td>
                <td className="px-4 py-3 font-mono text-xs">{u.registration?.cardNo ?? "—"}</td>
                <td className="px-4 py-3">
                  <form action={toggleUser}><input type="hidden" name="id" value={u.id} />
                    <button className={`badge ${u.active ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-600"}`}>{u.active ? t("ausers.active") : t("ausers.suspended")}</button>
                  </form>
                </td>
                <td className="px-4 py-3">
                  <form action={resetPassword} className="flex gap-2"><input type="hidden" name="id" value={u.id} /><input name="password" type="password" placeholder={t("ausers.newPassword")} minLength={8} className="input w-36 py-1" autoComplete="new-password" required /><button className="btn-outline py-1">{t("ausers.set")}</button></form>
                </td>
              </tr>
            ))}
            {!members.length && <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-500">{t("ausers.empty")}</td></tr>}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-xs text-slate-400">{t("ausers.toggleHint")}</p>
    </>
  );
}

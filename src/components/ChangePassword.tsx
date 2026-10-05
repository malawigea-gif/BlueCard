"use client";
import { useActionState } from "react";
import { changePasswordAction } from "@/app/actions/auth";
import { useT } from "@/lib/i18n/client";
import { Alert } from "./Alert";

export function ChangePassword() {
  const t = useT();
  const [state, action, pending] = useActionState(changePasswordAction, undefined);
  return (
    <form action={action} className="space-y-3">
      <Alert error={state?.error} ok={state?.ok} />
      <div><label className="label">{t("profile.currentPassword")}</label><input name="current" type="password" className="input" autoComplete="current-password" required /></div>
      <div><label className="label">{t("profile.newPassword")}</label><input name="next" type="password" minLength={8} className="input" autoComplete="new-password" required /></div>
      <button className="btn-outline" disabled={pending}>{t("profile.changePassword")}</button>
    </form>
  );
}

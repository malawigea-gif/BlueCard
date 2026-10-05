"use client";
import { useActionState } from "react";
import { loginAction } from "@/app/actions/auth";
import { useT } from "@/lib/i18n/client";
import { Alert } from "./Alert";

export function LoginForm({ next }: { next?: string }) {
  const t = useT();
  const [state, action, pending] = useActionState(loginAction, undefined);
  return (
    <form action={action} className="space-y-4">
      <Alert error={state?.error} />
      <input type="hidden" name="next" value={next ?? ""} />
      <div><label className="label">{t("login.email")}</label><input name="email" type="email" className="input" required autoFocus /></div>
      <div><label className="label">{t("login.password")}</label><input name="password" type="password" className="input" required /></div>
      <button className="btn-primary w-full py-2.5" disabled={pending}>{pending ? t("login.checking") : t("login.title")}</button>
    </form>
  );
}

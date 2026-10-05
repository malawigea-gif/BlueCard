"use client";
import { useActionState } from "react";
import { contactAction } from "@/app/actions/contact";
import { useT } from "@/lib/i18n/client";
import { Alert } from "./Alert";

export function ContactForm() {
  const t = useT();
  const [state, action, pending] = useActionState(contactAction, undefined);
  if (state?.ok) return <Alert ok={state.ok} />;
  return (
    <form action={action} className="space-y-4">
      <Alert error={state?.error} />
      <input type="text" name="website" className="hidden" tabIndex={-1} autoComplete="off" />
      <div className="grid gap-4 sm:grid-cols-2">
        <div><label className="label">{t("contact.name")}</label><input name="name" className="input" required /></div>
        <div><label className="label">{t("contact.phoneField")}</label><input name="phone" className="input" /></div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div><label className="label">{t("contact.emailField")}</label><input name="email" type="email" className="input" /></div>
        <div><label className="label">{t("contact.subject")}</label><input name="subject" className="input" /></div>
      </div>
      <div><label className="label">{t("contact.message")}</label><textarea name="message" rows={5} className="input" required /></div>
      <button className="btn-primary" disabled={pending}>{pending ? t("contact.sending") : t("contact.send")}</button>
    </form>
  );
}

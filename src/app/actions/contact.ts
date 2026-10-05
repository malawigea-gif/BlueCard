"use server";
import { db } from "@/lib/db";
import { str } from "@/lib/utils";
import { getT } from "@/lib/i18n/server";
import type { FormState } from "./auth";

export async function contactAction(_: FormState, fd: FormData): Promise<FormState> {
  const { t } = await getT();
  const name = str(fd, "name");
  const message = str(fd, "message");
  if (fd.get("website")) return { ok: t("contact.thanks") }; // spam honeypot
  if (!name || !message) return { error: t("contact.err.required") };
  if (message.length > 3000) return { error: t("contact.err.tooLong") };
  await db.contactMessage.create({
    data: { name, message, email: str(fd, "email") || null, phone: str(fd, "phone") || null, subject: str(fd, "subject") || null },
  });
  return { ok: t("contact.ok") };
}

"use server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { saveUpload, removeUpload } from "@/lib/upload";
import { str } from "@/lib/utils";
import { getT } from "@/lib/i18n/server";
import { DOC_KINDS } from "@/lib/journey";
import { audit } from "@/lib/audit";
import type { FormState } from "./auth";

async function myRegistration() {
  const s = await getSession();
  if (!s) return null;
  return db.registration.findUnique({ where: { userId: s.uid } });
}

export async function uploadMemberDocument(_: FormState, fd: FormData): Promise<FormState> {
  const { t } = await getT();
  const r = await myRegistration();
  if (!r || r.status !== "APPROVED") return { error: t("docs.err.notAllowed") };
  const kind = str(fd, "kind");
  if (!(DOC_KINDS as readonly string[]).includes(kind)) return { error: t("docs.err.kind") };
  const f = fd.get("file");
  if (!f || typeof f === "string" || f.size === 0) return { error: t("docs.err.file") };
  let file: string | null;
  try { file = await saveUpload(f, { allowPdf: true, private: true }); } catch (e) { return { error: (e as Error).message }; }
  if (!file) return { error: t("docs.err.file") };
  await db.memberDocument.create({ data: { registrationId: r.id, kind, file, name: f.name.slice(0, 200) } });
  await audit(r.email, "document.upload", `${kind}: ${f.name}`);
  revalidatePath("/profile");
  return { ok: t("docs.ok") };
}

export async function deleteMemberDocument(fd: FormData) {
  const r = await myRegistration();
  if (!r) return;
  const doc = await db.memberDocument.findFirst({ where: { id: Number(str(fd, "id")), registrationId: r.id } });
  if (!doc) return;
  await db.memberDocument.delete({ where: { id: doc.id } });
  await removeUpload(doc.file);
  revalidatePath("/profile");
}

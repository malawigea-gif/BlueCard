"use server";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { saveUpload, saveUploads, removeUpload } from "@/lib/upload";
import { saveSettings, DEFAULT_SETTINGS, type Settings } from "@/lib/settings";
import { slugify, str } from "@/lib/utils";
import { notify } from "@/lib/notify";
import { audit } from "@/lib/audit";
import { getT } from "@/lib/i18n/server";
import { tidyLine, tidyText } from "@/lib/text";
import { STAGES, stageKey } from "@/lib/journey";
import { FEES } from "@/lib/payments/config";
import { getJobFee, visaFeePaid } from "@/lib/payments/status";

function back(path: string, msg: string, kind: "msg" | "err" = "msg"): never {
  redirect(`${path}${path.includes("?") ? "&" : "?"}${kind}=${encodeURIComponent(msg)}`);
}
function refresh() { revalidatePath("/", "layout"); }

/* ---------- News / Articles ---------- */
export async function saveArticle(fd: FormData) {
  const s = await requireAdmin();
  const { t } = await getT();
  const id = Number(str(fd, "id")) || null;
  const title = tidyLine(str(fd, "title"));
  const summary = tidyText(str(fd, "summary"));
  const body = tidyText(str(fd, "body"));
  const base = id ? "/admin/news/" + id : "/admin/news/new";
  if (!title || !summary) back(base, t("anews.err.required"), "err");
  let image: string | null = null;
  try { image = await saveUpload(fd.get("image")); } catch (e) { back(base, (e as Error).message, "err"); }
  const data = {
    title, summary, body,
    titleDe: tidyLine(str(fd, "titleDe")), summaryDe: tidyText(str(fd, "summaryDe")), bodyDe: tidyText(str(fd, "bodyDe")),
    featured: fd.get("featured") === "on", published: fd.get("published") === "on",
  };
  if (id) {
    const old = await db.article.findUnique({ where: { id } });
    const remove = fd.get("removeImage") === "on";
    if ((image || remove) && old?.image) await removeUpload(old.image);
    await db.article.update({ where: { id }, data: { ...data, ...(image ? { image } : remove ? { image: null } : {}) } });
  } else {
    let slug = slugify(title);
    if (await db.article.findUnique({ where: { slug } })) slug = `${slug}-${Date.now().toString(36)}`;
    await db.article.create({ data: { ...data, slug, image, authorId: s.uid } });
  }
  await audit(s.name, id ? "article.update" : "article.create", title);
  refresh();
  back("/admin/news", t("anews.saved"));
}

export async function deleteArticle(fd: FormData) {
  const s = await requireAdmin();
  const { t } = await getT();
  const id = Number(str(fd, "id"));
  const a = await db.article.delete({ where: { id } });
  await removeUpload(a.image);
  await audit(s.name, "article.delete", a.title);
  refresh();
  back("/admin/news", t("anews.deleted"));
}

/* ---------- Programs ---------- */
export async function saveProgram(fd: FormData) {
  const s = await requireAdmin();
  const { t } = await getT();
  const id = Number(str(fd, "id")) || null;
  const title = tidyLine(str(fd, "title"));
  const base = id ? "/admin/programs/" + id : "/admin/programs/new";
  if (!title) back(base, t("aprog.err.required"), "err");
  let image: string | null = null;
  try { image = await saveUpload(fd.get("image")); } catch (e) { back(base, (e as Error).message, "err"); }
  const data = {
    title, summary: tidyText(str(fd, "summary")), body: tidyText(str(fd, "body")),
    titleDe: tidyLine(str(fd, "titleDe")), summaryDe: tidyText(str(fd, "summaryDe")), bodyDe: tidyText(str(fd, "bodyDe")),
    sortOrder: Number(str(fd, "sortOrder")) || 0, active: fd.get("active") === "on",
  };
  if (id) {
    const old = await db.program.findUnique({ where: { id } });
    const remove = fd.get("removeImage") === "on";
    if ((image || remove) && old?.image) await removeUpload(old.image);
    await db.program.update({ where: { id }, data: { ...data, ...(image ? { image } : remove ? { image: null } : {}) } });
  } else {
    await db.program.create({ data: { ...data, image } });
  }
  await audit(s.name, "program.save", title);
  refresh();
  back("/admin/programs", t("aprog.saved"));
}

export async function deleteProgram(fd: FormData) {
  const s = await requireAdmin();
  const { t } = await getT();
  const p = await db.program.delete({ where: { id: Number(str(fd, "id")) } });
  await removeUpload(p.image);
  await audit(s.name, "program.delete", p.title);
  refresh();
  back("/admin/programs", t("aprog.deleted"));
}

/* ---------- Gallery ---------- */
export async function uploadGallery(fd: FormData) {
  const s = await requireAdmin();
  const { t } = await getT();
  let urls: string[] = [];
  try { urls = await saveUploads(fd.getAll("images")); } catch (e) { back("/admin/gallery", (e as Error).message, "err"); }
  if (!urls.length) back("/admin/gallery", t("agal.err.select"), "err");
  const caption = tidyLine(str(fd, "caption")) || null;
  const captionDe = tidyLine(str(fd, "captionDe")) || null;
  await db.galleryImage.createMany({ data: urls.map((url) => ({ url, caption, captionDe })) });
  await audit(s.name, "gallery.upload", `${urls.length}`);
  refresh();
  back("/admin/gallery", t("agal.added", { n: urls.length }));
}

export async function updateGalleryImage(fd: FormData) {
  await requireAdmin();
  const { t } = await getT();
  await db.galleryImage.update({
    where: { id: Number(str(fd, "id")) },
    data: { caption: tidyLine(str(fd, "caption")) || null, captionDe: tidyLine(str(fd, "captionDe")) || null, sortOrder: Number(str(fd, "sortOrder")) || 0 },
  });
  refresh();
  back("/admin/gallery", t("agal.updated"));
}

export async function deleteGalleryImage(fd: FormData) {
  await requireAdmin();
  const { t } = await getT();
  const g = await db.galleryImage.delete({ where: { id: Number(str(fd, "id")) } });
  await removeUpload(g.url);
  refresh();
  back("/admin/gallery", t("agal.deleted"));
}

/* ---------- Registrations ---------- */
async function nextCardNo() {
  const year = new Date().getFullYear();
  const prefix = `BC-${year}-`;
  const last = await db.registration.findFirst({ where: { cardNo: { startsWith: prefix } }, orderBy: { cardNo: "desc" } });
  const n = last?.cardNo ? Number(last.cardNo.slice(prefix.length)) + 1 : 1;
  return prefix + String(n).padStart(5, "0");
}

export async function approveRegistration(fd: FormData) {
  const s = await requireAdmin();
  const { t } = await getT();
  const id = Number(str(fd, "id"));
  const r = await db.registration.findUnique({ where: { id } });
  if (!r) back("/admin/registrations", t("areg.notFound"), "err");
  const cardNo = r.cardNo ?? (await nextCardNo());
  await db.registration.update({ where: { id }, data: { status: "APPROVED", cardNo, rejectReason: null, reviewedBy: s.name, reviewedAt: new Date() } });
  await db.user.update({ where: { id: r.userId }, data: { active: true } });
  await notify({ email: r.email, phone: r.phone }, t("notify.approvedSubject"), t("notify.approvedBody", { cardNo }));
  await audit(s.name, "registration.approve", `${r.nic} → ${cardNo}`);
  back(`/admin/registrations/${id}`, t("areg.approved", { cardNo }));
}

export async function setRegistrationStage(fd: FormData) {
  const s = await requireAdmin();
  const { t } = await getT();
  const id = Number(str(fd, "id"));
  const r = await db.registration.findUnique({ where: { id } });
  if (!r) back("/admin/registrations", t("areg.notFound"), "err");
  if (r.status !== "APPROVED") back(`/admin/registrations/${id}`, t("areg.progressOnlyApproved"), "err");
  const stage = Math.min(Math.max(Number(str(fd, "stage")) || 1, 1), STAGES.length);
  const note = tidyText(str(fd, "note")) || null;
  // fees: job matching (step 5) must have been paid before moving past it, the visa fee (step 7) likewise
  if (stage > FEES.JOB_MATCHING.stage && !(await getJobFee(r.userId)).everPaid) back(`/admin/registrations/${id}`, t("apay.err.gateJob"), "err");
  if (stage > FEES.VISA.stage && !(await visaFeePaid(r.userId))) back(`/admin/registrations/${id}`, t("apay.err.gateVisa"), "err");
  await db.registration.update({ where: { id }, data: { stage, stageNote: note, stageUpdatedAt: new Date() } });
  const title = t(`journey.${stageKey(stage)}.title`);
  if (stage !== r.stage) await notify({ email: r.email, phone: r.phone }, t("notify.stageSubject", { title }), t("notify.stageBody", { n: stage, title }));
  await audit(s.name, "registration.stage", `${r.nic}: ${stage}`);
  back(`/admin/registrations/${id}`, t("areg.progressSaved", { n: stage, title }));
}

export async function rejectRegistration(fd: FormData) {
  const s = await requireAdmin();
  const { t } = await getT();
  const id = Number(str(fd, "id"));
  const reason = str(fd, "reason");
  if (!reason) back(`/admin/registrations/${id}`, t("areg.err.reason"), "err");
  const r = await db.registration.update({ where: { id }, data: { status: "REJECTED", rejectReason: reason, reviewedBy: s.name, reviewedAt: new Date() } });
  await notify({ email: r.email, phone: r.phone }, t("notify.rejectedSubject"), t("notify.rejectedBody", { reason }));
  await audit(s.name, "registration.reject", `${r.nic}: ${reason}`);
  back(`/admin/registrations/${id}`, t("areg.rejected"));
}

export async function resetRegistration(fd: FormData) {
  const s = await requireAdmin();
  const { t } = await getT();
  const id = Number(str(fd, "id"));
  await db.registration.update({ where: { id }, data: { status: "PENDING", rejectReason: null } });
  await audit(s.name, "registration.reset", String(id));
  back(`/admin/registrations/${id}`, t("areg.reset"));
}

export async function deleteRegistration(fd: FormData) {
  const s = await requireAdmin();
  const { t } = await getT();
  const id = Number(str(fd, "id"));
  const r = await db.registration.findUnique({ where: { id } });
  if (r) {
    await removeUpload(r.photo);
    await removeUpload(r.document);
    for (const d of await db.memberDocument.findMany({ where: { registrationId: r.id } })) await removeUpload(d.file);
    await db.user.delete({ where: { id: r.userId } });
    await audit(s.name, "registration.delete", r.nic);
  }
  back("/admin/registrations", t("areg.deleted"));
}

/* ---------- Settings / About / Contact ---------- */
export async function saveSiteSettings(fd: FormData) {
  const s = await requireAdmin();
  const { t } = await getT();
  const back_ = str(fd, "_back") || "/admin/settings";
  const values: Partial<Settings> = {};
  for (const k of Object.keys(DEFAULT_SETTINGS) as (keyof Settings)[]) {
    if (k === "logo") continue;
    if (fd.has(k)) values[k] = str(fd, k);
  }
  if (fd.has("mapEmbed")) {
    const m = str(fd, "mapEmbed");
    const src = m.match(/src="([^"]+)"/)?.[1] ?? m; // accepts either the full iframe code or just the src URL
    values.mapEmbed = src.startsWith("https://") ? src : "";
  }
  try {
    const logo = await saveUpload(fd.get("logo"));
    if (logo) values.logo = logo;
  } catch (e) { back(back_, (e as Error).message, "err"); }
  if (fd.get("removeLogo") === "on") values.logo = "";
  await saveSettings(values);
  await audit(s.name, "settings.save", Object.keys(values).join(","));
  refresh();
  back(back_, t("aset.saved"));
}

export async function savePartner(fd: FormData) {
  await requireAdmin();
  const { t } = await getT();
  const id = Number(str(fd, "id")) || null;
  const name = str(fd, "name");
  if (!name) back("/admin/about", t("aabout.err.name"), "err");
  let logo: string | null = null;
  try { logo = await saveUpload(fd.get("logo")); } catch (e) { back("/admin/about", (e as Error).message, "err"); }
  const data = { name, description: str(fd, "description") || null, descriptionDe: str(fd, "descriptionDe") || null, website: str(fd, "website") || null, sortOrder: Number(str(fd, "sortOrder")) || 0 };
  if (id) await db.partner.update({ where: { id }, data: { ...data, ...(logo ? { logo } : {}) } });
  else await db.partner.create({ data: { ...data, logo } });
  refresh();
  back("/admin/about", t("aabout.saved"));
}

export async function deletePartner(fd: FormData) {
  await requireAdmin();
  const { t } = await getT();
  const p = await db.partner.delete({ where: { id: Number(str(fd, "id")) } });
  await removeUpload(p.logo);
  refresh();
  back("/admin/about", t("aset.deleted"));
}

/* ---------- Messages ---------- */
export async function toggleMessage(fd: FormData) {
  await requireAdmin();
  const id = Number(str(fd, "id"));
  const m = await db.contactMessage.findUnique({ where: { id } });
  if (m) await db.contactMessage.update({ where: { id }, data: { isRead: !m.isRead } });
  revalidatePath("/admin/messages");
}

export async function deleteMessage(fd: FormData) {
  await requireAdmin();
  const { t } = await getT();
  await db.contactMessage.delete({ where: { id: Number(str(fd, "id")) } });
  back("/admin/messages", t("amsg.deleted"));
}

/* ---------- Users ---------- */
export async function createAdmin(fd: FormData) {
  const s = await requireAdmin();
  const { t } = await getT();
  const name = str(fd, "name");
  const email = str(fd, "email").toLowerCase();
  const password = str(fd, "password");
  if (!name || !email || password.length < 8) back("/admin/users", t("ausers.err.create"), "err");
  if (await db.user.findUnique({ where: { email } })) back("/admin/users", t("ausers.err.emailTaken"), "err");
  await db.user.create({ data: { name, email, role: "ADMIN", passwordHash: await bcrypt.hash(password, 10) } });
  await audit(s.name, "admin.create", email);
  back("/admin/users", t("ausers.created"));
}

export async function resetPassword(fd: FormData) {
  const s = await requireAdmin();
  const { t } = await getT();
  const id = Number(str(fd, "id"));
  const password = str(fd, "password");
  if (password.length < 8) back("/admin/users", t("ausers.err.passwordLen"), "err");
  const u = await db.user.update({ where: { id }, data: { passwordHash: await bcrypt.hash(password, 10) } });
  await audit(s.name, "user.resetPassword", u.email);
  back("/admin/users", t("ausers.passwordReset", { email: u.email }));
}

export async function toggleUser(fd: FormData) {
  const s = await requireAdmin();
  const { t } = await getT();
  const id = Number(str(fd, "id"));
  if (id === s.uid) back("/admin/users", t("ausers.err.self"), "err");
  const u = await db.user.findUnique({ where: { id } });
  if (u) {
    await db.user.update({ where: { id }, data: { active: !u.active } });
    await audit(s.name, u.active ? "user.disable" : "user.enable", u.email);
  }
  back("/admin/users", t("ausers.updated"));
}

export async function deleteAdmin(fd: FormData) {
  const s = await requireAdmin();
  const { t } = await getT();
  const id = Number(str(fd, "id"));
  if (id === s.uid) back("/admin/users", t("ausers.err.selfDelete"), "err");
  const admins = await db.user.count({ where: { role: "ADMIN" } });
  if (admins <= 1) back("/admin/users", t("ausers.err.lastAdmin"), "err");
  const u = await db.user.delete({ where: { id } });
  await audit(s.name, "admin.delete", u.email);
  back("/admin/users", t("ausers.deleted"));
}

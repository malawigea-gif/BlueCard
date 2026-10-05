"use server";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { createSession, destroySession, getSession } from "@/lib/auth";
import { saveUpload } from "@/lib/upload";
import { str, validNic, validPhone, GENDERS } from "@/lib/utils";
import { getT } from "@/lib/i18n/server";
import { makeT } from "@/lib/i18n/dict";
import { getCountry, getStates, dialCode } from "@/lib/geo";
import { notify } from "@/lib/notify";
import { audit } from "@/lib/audit";

export type FormState = { error?: string; ok?: string } | undefined;

export async function loginAction(_: FormState, fd: FormData): Promise<FormState> {
  const { t } = await getT();
  const email = str(fd, "email").toLowerCase();
  const password = str(fd, "password");
  const next = str(fd, "next");
  if (!email || !password) return { error: t("login.err.missing") };
  const user = await db.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) return { error: t("login.err.wrong") };
  if (!user.active) return { error: t("login.err.disabled") };
  await createSession({ uid: user.id, role: user.role as "ADMIN" | "USER", name: user.name });
  await audit(user.email, "login");
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "";
  if (user.role === "ADMIN") redirect(safeNext.startsWith("/admin") ? safeNext : "/admin");
  redirect("/profile");
}

export async function logoutAction() {
  await destroySession();
  redirect("/");
}

export async function registerAction(_: FormState, fd: FormData): Promise<FormState> {
  const { t } = await getT();
  const d = {
    fullName: str(fd, "fullName"),
    nic: str(fd, "nic").toUpperCase().replace(/[\s-]/g, ""),
    dob: str(fd, "dob"),
    gender: str(fd, "gender"),
    address: str(fd, "address"),
    country: str(fd, "country").toUpperCase(),
    state: str(fd, "state"),
    phone: str(fd, "phone"),
    email: str(fd, "email").toLowerCase(),
    occupation: str(fd, "occupation"),
    password: str(fd, "password"),
    password2: str(fd, "password2"),
  };
  if (!d.fullName || !d.nic || !d.dob || !d.gender || !d.address || !d.country || !d.phone || !d.email)
    return { error: t("register.err.required") };
  if (!(GENDERS as readonly string[]).includes(d.gender)) return { error: t("register.err.required") };
  if (!validNic(d.nic)) return { error: t("register.err.nic") };
  if (!getCountry(d.country)) return { error: t("register.err.country") };
  const states = getStates(d.country);
  if (states.length && !states.includes(d.state)) return { error: t("register.err.state") };
  // national number + the country's calling code → "+49 15123456789"
  const local = d.phone.replace(/[^\d]/g, "").replace(/^0+/, "");
  const phone = `+${dialCode(d.country)} ${local}`;
  if (!validPhone(phone)) return { error: t("register.err.phone") };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email)) return { error: t("register.err.email") };
  if (d.password.length < 8) return { error: t("register.err.passwordLen") };
  if (d.password !== d.password2) return { error: t("register.err.passwordMatch") };
  if (fd.get("agree") !== "on") return { error: t("register.err.agree") };
  const dob = new Date(d.dob);
  if (isNaN(dob.getTime()) || dob > new Date()) return { error: t("register.err.dob") };

  if (await db.user.findUnique({ where: { email: d.email } })) return { error: t("register.err.emailTaken") };
  if (await db.registration.findUnique({ where: { nic: d.nic } })) return { error: t("register.err.nicTaken") };

  let photo: string | null = null;
  let document: string | null = null;
  try {
    photo = await saveUpload(fd.get("photo"), { private: true });
    document = await saveUpload(fd.get("document"), { allowPdf: true, private: true });
  } catch (e) {
    return { error: (e as Error).message };
  }

  const user = await db.user.create({
    data: {
      name: d.fullName,
      email: d.email,
      phone,
      passwordHash: await bcrypt.hash(d.password, 10),
      role: "USER",
      registration: {
        create: {
          fullName: d.fullName, nic: d.nic, dob, gender: d.gender, address: d.address, country: d.country, district: d.state,
          phone, email: d.email, occupation: d.occupation || null, photo, document,
        },
      },
    },
  });
  await audit(d.email, "register", d.nic);
  { const en = makeT("en"); await notify({ email: d.email, phone, name: d.fullName }, en("notify.receivedSubject"), en("notify.receivedBody")); }
  await createSession({ uid: user.id, role: "USER", name: user.name });
  redirect("/profile?new=1");
}

export async function changePasswordAction(_: FormState, fd: FormData): Promise<FormState> {
  const { t } = await getT();
  const s = await getSession();
  if (!s) return { error: t("profile.err.login") };
  const current = str(fd, "current");
  const next = str(fd, "next");
  if (next.length < 8) return { error: t("profile.err.newLen") };
  const user = await db.user.findUnique({ where: { id: s.uid } });
  if (!user || !(await bcrypt.compare(current, user.passwordHash))) return { error: t("profile.err.current") };
  await db.user.update({ where: { id: s.uid }, data: { passwordHash: await bcrypt.hash(next, 10) } });
  return { ok: t("profile.ok") };
}

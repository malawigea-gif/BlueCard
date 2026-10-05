export function slugify(s: string) {
  const base = s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/ß/g, "ss")
    .replace(/[̀-ͯ]/g, "")
    .trim()
    .replace(/[^\p{L}\p{N}\p{M}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return base || "post";
}

export function str(fd: FormData, k: string) {
  const v = fd.get(k);
  return typeof v === "string" ? v.trim() : "";
}

export const STATUSES = ["PENDING", "APPROVED", "REJECTED"] as const;
export const GENDERS = ["MALE", "FEMALE", "OTHER"] as const;

// Passport number (stored in the "nic" column) — 6 to 12 letters/digits, any country
export function validNic(nic: string) {
  return /^[A-Z0-9]{6,12}$/.test(nic);
}

// International phone number: "+" and 7–15 digits in total (E.164)
export function validPhone(phone: string) {
  return /^\+\d{7,15}$/.test(phone.replace(/[\s\-()/]/g, ""));
}

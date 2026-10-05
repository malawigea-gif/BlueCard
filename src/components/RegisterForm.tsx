"use client";
import { useActionState, useEffect, useState } from "react";
import { registerAction } from "@/app/actions/auth";
import { GENDERS } from "@/lib/utils";
import type { CountryOption } from "@/lib/geo";
import { useT } from "@/lib/i18n/client";
import { Alert } from "./Alert";

function Section({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <fieldset className="card p-6">
      <legend className="sr-only">{title}</legend>
      <div className="mb-5 flex items-center gap-3">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-navy-700 text-sm font-bold text-white">{n}</span>
        <h2 className="text-lg font-bold text-navy-800">{title}</h2>
      </div>
      {children}
    </fieldset>
  );
}

const FILE = "input file:mr-3 file:rounded file:border-0 file:bg-navy-50 file:px-3 file:py-1 file:text-navy-700";

export function RegisterForm({ countries }: { countries: CountryOption[] }) {
  const t = useT();
  const [state, action, pending] = useActionState(registerAction, undefined);
  return (
    <form action={action} className="space-y-6">
      <Section n={1} title={t("register.s.personal")}>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2"><label className="label">{t("register.fullName")}</label><input name="fullName" className="input" autoComplete="name" required /></div>
          <div><label className="label">{t("register.nic")}</label><input name="nic" className="input" placeholder="N1234567" autoCapitalize="characters" required /></div>
          <div><label className="label">{t("register.dob")}</label><input name="dob" type="date" className="input" required /></div>
          <div>
            <label className="label">{t("register.gender")}</label>
            <select name="gender" className="input" required defaultValue="">
              <option value="" disabled>{t("register.select")}</option>
              {GENDERS.map((g) => <option key={g} value={g}>{t(`gender.${g}`)}</option>)}
            </select>
          </div>
          <div><label className="label">{t("register.occupation")}</label><input name="occupation" className="input" /></div>
        </div>
      </Section>

      <Section n={2} title={t("register.s.contact")}>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2"><label className="label">{t("register.address")}</label><textarea name="address" rows={2} className="input" autoComplete="street-address" required /></div>
          <CountryStatePhone countries={countries} />
          <div className="sm:col-span-2"><label className="label">{t("register.email")} <span className="font-normal text-slate-500">{t("register.emailHint")}</span></label><input name="email" type="email" className="input" autoComplete="email" required /></div>
        </div>
      </Section>

      <Section n={3} title={t("register.s.documents")}>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label className="label">{t("register.photo")}</label><input name="photo" type="file" accept="image/*" className={FILE} /></div>
          <div><label className="label">{t("register.document")}</label><input name="document" type="file" accept="image/*,application/pdf" className={FILE} /></div>
        </div>
      </Section>

      <Section n={4} title={t("register.s.password")}>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label className="label">{t("register.password")}</label><input name="password" type="password" minLength={8} className="input" autoComplete="new-password" required /></div>
          <div><label className="label">{t("register.password2")}</label><input name="password2" type="password" minLength={8} className="input" autoComplete="new-password" required /></div>
        </div>
        <label className="mt-5 flex items-start gap-3 text-sm text-slate-700">
          <input type="checkbox" name="agree" className="mt-1 h-4 w-4" required />
          <span>{t("register.agree")}</span>
        </label>
      </Section>

      <Alert error={state?.error} />
      <button className="btn-primary w-full py-3 text-base" disabled={pending}>{pending ? t("register.submitting") : t("register.submit")}</button>
    </form>
  );
}

/** Country → State/Province (loaded for the chosen country) → phone number with the country's calling code. */
function CountryStatePhone({ countries }: { countries: CountryOption[] }) {
  const t = useT();
  const [country, setCountry] = useState("");
  const [states, setStates] = useState<string[] | null>(null);
  const [loading, setLoading] = useState(false);
  const c = countries.find((x) => x.code === country);

  useEffect(() => {
    if (!country) { setStates(null); return; }
    let alive = true;
    setLoading(true);
    fetch(`/api/states?country=${country}`)
      .then((r) => (r.ok ? r.json() : []))
      .then((list: string[]) => { if (alive) setStates(list); })
      .catch(() => { if (alive) setStates([]); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [country]);

  return (
    <>
      <div>
        <label className="label">{t("register.country")}</label>
        <select name="country" className="input" required value={country} onChange={(e) => setCountry(e.target.value)} autoComplete="country">
          <option value="" disabled>{t("register.select")}</option>
          {countries.map((x) => <option key={x.code} value={x.code}>{x.name}</option>)}
        </select>
      </div>
      <div>
        <label className="label">{states && states.length === 0 ? t("register.stateOptional") : t("register.state")}</label>
        {states && states.length > 0 ? (
          <select key={country} name="state" className="input" required defaultValue="" autoComplete="address-level1">
            <option value="" disabled>{t("register.select")}</option>
            {states.map((s) => <option key={s}>{s}</option>)}
          </select>
        ) : (
          <input key={country} name="state" className="input" disabled={!country || loading} autoComplete="address-level1"
            placeholder={!country ? t("register.selectCountryFirst") : loading ? "…" : ""} />
        )}
      </div>
      <div className="sm:col-span-2">
        <label className="label">{t("register.phone")}</label>
        <div className={`flex overflow-hidden rounded-lg border border-slate-300 bg-white focus-within:border-navy-500 focus-within:ring-2 focus-within:ring-navy-100 ${!c ? "opacity-60" : ""}`}>
          <span className="flex shrink-0 items-center gap-1.5 border-r border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-700" aria-hidden>
            {c ? `+${c.dial}` : "+ …"}
          </span>
          <input name="phone" type="tel" inputMode="tel" autoComplete="tel-national" required disabled={!c}
            className="min-w-0 flex-1 px-3 py-2 text-sm outline-none disabled:bg-white"
            placeholder={c ? t("register.phoneLocal") : t("register.selectCountryFirst")} />
        </div>
      </div>
    </>
  );
}

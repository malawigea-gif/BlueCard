"use client";
import { useEffect, useRef } from "react";

/** A hidden form that posts itself to the payment gateway as soon as the page opens. */
export function AutoSubmit({ action, fields, label }: { action: string; fields: Record<string, string>; label: string }) {
  const form = useRef<HTMLFormElement>(null);
  useEffect(() => { form.current?.submit(); }, []);
  return (
    <form ref={form} method="post" action={action} className="mt-6">
      {Object.entries(fields).map(([k, v]) => <input key={k} type="hidden" name={k} value={v} />)}
      <button className="btn-primary w-full">{label}</button>
    </form>
  );
}

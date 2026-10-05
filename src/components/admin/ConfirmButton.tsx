"use client";
import { useT } from "@/lib/i18n/client";

export function ConfirmButton({ children, message, className = "btn-danger" }: { children: React.ReactNode; message?: string; className?: string }) {
  const t = useT();
  return (
    <button className={className} onClick={(e) => { if (!confirm(message ?? t("common.areYouSure"))) e.preventDefault(); }}>
      {children}
    </button>
  );
}

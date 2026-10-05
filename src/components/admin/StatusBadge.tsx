import { getT } from "@/lib/i18n/server";
import { statusLabel } from "@/lib/i18n/dict";

export async function StatusBadge({ status }: { status: string }) {
  const { t } = await getT();
  const c = status === "APPROVED" ? "bg-emerald-100 text-emerald-700" : status === "REJECTED" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700";
  return <span className={`badge ${c}`}>{statusLabel(status, t)}</span>;
}

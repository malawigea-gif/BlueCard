import { getT } from "@/lib/i18n/server";

export async function ImageField({ name = "image", current, label }: { name?: string; current?: string | null; label?: string }) {
  const { t } = await getT();
  return (
    <div>
      <label className="label">{label ?? t("common.image")}</label>
      {current && (
        <div className="mb-2 flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={current} alt="" className="h-20 w-28 rounded-lg object-cover" />
          <label className="flex items-center gap-2 text-sm text-slate-600"><input type="checkbox" name={`remove${name[0].toUpperCase()}${name.slice(1)}`} /> {t("common.remove")}</label>
        </div>
      )}
      <input type="file" name={name} accept="image/*" className="input file:mr-3 file:rounded file:border-0 file:bg-navy-50 file:px-3 file:py-1 file:text-navy-700" />
    </div>
  );
}

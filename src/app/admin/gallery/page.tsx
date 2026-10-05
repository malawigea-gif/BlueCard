import { db } from "@/lib/db";
import { uploadGallery, updateGalleryImage, deleteGalleryImage } from "@/app/actions/admin";
import { PageTitle } from "@/components/admin/PageTitle";
import { Flash, type SP } from "@/components/admin/Flash";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { getT } from "@/lib/i18n/server";

export default async function GalleryAdmin({ searchParams }: { searchParams: SP }) {
  const { t } = await getT();
  const images = await db.galleryImage.findMany({ orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }] });
  return (
    <>
      <PageTitle title={t("admin.nav.gallery")} sub={t("agal.sub")} />
      <Flash searchParams={searchParams} />
      <form action={uploadGallery} className="card mb-6 grid gap-4 p-5 sm:grid-cols-[1fr_1fr_1fr_auto] sm:items-end">
        <div><label className="label">{t("agal.photos")}</label><input type="file" name="images" accept="image/*" multiple required className="input file:mr-3 file:rounded file:border-0 file:bg-navy-50 file:px-3 file:py-1 file:text-navy-700" /></div>
        <div><label className="label">{t("agal.captionEn")}</label><input name="caption" className="input" lang="en" /></div>
        <div><label className="label">{t("agal.captionDe")}</label><input name="captionDe" className="input" lang="de" /></div>
        <button className="btn-primary">{t("agal.upload")}</button>
      </form>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {images.map((g) => (
          <div key={g.id} className="card overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={g.url} alt="" className="aspect-[4/3] w-full object-cover" />
            <form action={updateGalleryImage} className="space-y-2 p-3">
              <input type="hidden" name="id" value={g.id} />
              <input name="caption" defaultValue={g.caption ?? ""} placeholder={t("agal.captionEn")} className="input py-1.5" lang="en" />
              <input name="captionDe" defaultValue={g.captionDe ?? ""} placeholder={t("agal.captionDe")} className="input py-1.5" lang="de" />
              <div className="flex gap-2">
                <input name="sortOrder" type="number" defaultValue={g.sortOrder} className="input w-20 py-1.5" title={t("agal.order")} />
                <button className="btn-outline flex-1 py-1.5">{t("common.save")}</button>
              </div>
            </form>
            <form action={deleteGalleryImage} className="px-3 pb-3"><input type="hidden" name="id" value={g.id} /><ConfirmButton className="btn-danger w-full py-1.5" message={t("agal.deleteConfirm")}>{t("common.delete")}</ConfirmButton></form>
          </div>
        ))}
      </div>
      {!images.length && <p className="text-sm text-slate-500">{t("agal.empty")}</p>}
    </>
  );
}

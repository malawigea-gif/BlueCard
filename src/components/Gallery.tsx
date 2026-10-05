"use client";
import { useEffect, useState } from "react";
import { useT } from "@/lib/i18n/client";

type Img = { id: number; url: string; caption: string | null };

export function Gallery({ images }: { images: Img[] }) {
  const t = useT();
  const [open, setOpen] = useState<number | null>(null);
  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
      if (e.key === "ArrowRight") setOpen((i) => (i === null ? i : (i + 1) % images.length));
      if (e.key === "ArrowLeft") setOpen((i) => (i === null ? i : (i - 1 + images.length) % images.length));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, images.length]);

  if (!images.length) return <p className="text-sm text-slate-500">{t("gallery.empty")}</p>;
  const cur = open !== null ? images[open] : null;
  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {images.map((img, i) => (
          <button key={img.id} onClick={() => setOpen(i)} className="group relative aspect-[4/3] overflow-hidden rounded-lg bg-slate-200">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img.url} alt={img.caption ?? ""} className="h-full w-full object-cover transition duration-300 group-hover:scale-105" loading="lazy" />
            {img.caption && (
              <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2 text-left text-xs text-white opacity-0 transition group-hover:opacity-100">
                {img.caption}
              </span>
            )}
          </button>
        ))}
      </div>
      {cur && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4" onClick={() => setOpen(null)}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={cur.url} alt={cur.caption ?? ""} className="max-h-[85vh] max-w-full rounded-lg" onClick={(e) => e.stopPropagation()} />
          {cur.caption && <div className="absolute bottom-6 left-0 right-0 text-center text-sm text-white">{cur.caption}</div>}
          <button className="absolute right-4 top-4 text-3xl text-white" aria-label={t("common.close")}>×</button>
        </div>
      )}
    </>
  );
}

"use client";
import { useEffect } from "react";

// Large photos from phones are made smaller in the browser before they are uploaded
// (longest side max 2000 px). This keeps uploads fast and under the hosting limit (Vercel: 4.5 MB per request).
const LIMIT = 1024 * 1024; // only images above 1 MB are shrunk
const MAX_SIDE = 2000;
const TYPES = ["image/jpeg", "image/png", "image/webp"];

async function shrink(file: File): Promise<File> {
  if (!TYPES.includes(file.type) || file.size <= LIMIT) return file;
  try {
    const bmp = await createImageBitmap(file);
    const scale = Math.min(1, MAX_SIDE / Math.max(bmp.width, bmp.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bmp.width * scale);
    canvas.height = Math.round(bmp.height * scale);
    canvas.getContext("2d")!.drawImage(bmp, 0, 0, canvas.width, canvas.height);
    bmp.close();
    // PNG keeps its transparency (logos); photos become JPEG
    const type = file.type === "image/png" ? "image/png" : "image/jpeg";
    const blob = await new Promise<Blob | null>((ok) => canvas.toBlob(ok, type, 0.85));
    if (!blob || blob.size >= file.size) return file;
    const name = type === "image/jpeg" ? file.name.replace(/\.(png|webp|jpe?g)$/i, "") + ".jpg" : file.name;
    return new File([blob], name, { type, lastModified: file.lastModified });
  } catch {
    return file;
  }
}

export function ImageShrinker() {
  useEffect(() => {
    const pending = new Set<Promise<void>>();

    const onChange = (e: Event) => {
      const input = e.target;
      if (!(input instanceof HTMLInputElement) || input.type !== "file" || !input.files?.length) return;
      if (input.dataset.shrunk === "1") { delete input.dataset.shrunk; return; }
      const files = Array.from(input.files);
      if (!files.some((f) => TYPES.includes(f.type) && f.size > LIMIT)) return;
      const job = (async () => {
        const out = await Promise.all(files.map(shrink));
        const dt = new DataTransfer();
        out.forEach((f) => dt.items.add(f));
        input.files = dt.files;
      })().finally(() => pending.delete(job));
      pending.add(job);
    };

    // a form submitted while a photo is still being made smaller waits for it
    const onSubmit = (e: SubmitEvent) => {
      if (!pending.size) return;
      const form = e.target as HTMLFormElement;
      const submitter = e.submitter as HTMLElement | null;
      e.preventDefault();
      e.stopPropagation();
      Promise.all(pending).then(() => form.requestSubmit(submitter instanceof HTMLButtonElement || submitter instanceof HTMLInputElement ? submitter : undefined));
    };

    document.addEventListener("change", onChange, true);
    document.addEventListener("submit", onSubmit, true);
    return () => {
      document.removeEventListener("change", onChange, true);
      document.removeEventListener("submit", onSubmit, true);
    };
  }, []);
  return null;
}

"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** Reloads the page data every few seconds while a payment is still being confirmed. */
export function AutoRefresh({ seconds = 5, times = 24 }: { seconds?: number; times?: number }) {
  const router = useRouter();
  useEffect(() => {
    let n = 0;
    const id = setInterval(() => { if (++n > times) clearInterval(id); else router.refresh(); }, seconds * 1000);
    return () => clearInterval(id);
  }, [router, seconds, times]);
  return null;
}

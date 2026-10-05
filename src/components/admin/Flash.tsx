import { Alert } from "../Alert";
export async function Flash({ searchParams }: { searchParams: Promise<{ msg?: string; err?: string }> }) {
  const sp = await searchParams;
  if (!sp.msg && !sp.err) return null;
  return <div className="mb-5"><Alert ok={sp.msg} error={sp.err} /></div>;
}
export type SP = Promise<{ msg?: string; err?: string; [k: string]: string | undefined }>;

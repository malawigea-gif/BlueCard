import { Logo } from "./Logo";

type R = { cardNo: string | null; fullName: string; nic: string; district: string; photo: string | null; reviewedAt: Date | null };

export function BlueCard({ r, siteName, logo, issuedLabel, passportLabel }: { r: R; siteName: string; logo?: string; issuedLabel?: string; passportLabel?: string }) {
  return (
    <div className="relative mx-auto aspect-[1.586] w-full max-w-md overflow-hidden rounded-2xl bg-gradient-to-br from-navy-600 via-navy-700 to-navy-900 p-5 text-white shadow-xl print:shadow-none">
      <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/10" />
      <div className="absolute -bottom-20 -left-10 h-48 w-48 rounded-full bg-white/5" />
      <div className="relative flex items-center gap-2">
        <Logo src={logo} size={30} />
        <div className="text-sm font-semibold">{siteName}</div>
        <div className="ml-auto rounded bg-gold-400 px-2 py-0.5 text-[10px] font-bold tracking-widest text-navy-900">BLUE CARD</div>
      </div>
      <div className="relative mt-4 flex gap-4">
        <div className="h-24 w-20 shrink-0 overflow-hidden rounded-lg bg-white/15">
          {r.photo && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={r.photo} alt="" className="h-full w-full object-cover" />
          )}
        </div>
        <div className="min-w-0 text-sm leading-6">
          <div className="truncate text-base font-bold">{r.fullName}</div>
          <div className="text-navy-100">{passportLabel ?? "Passport"}: {r.nic}</div>
          <div className="text-navy-100">{r.district}</div>
        </div>
      </div>
      <div className="absolute bottom-4 left-5 right-5 flex items-end justify-between">
        <div className="font-mono text-lg font-bold tracking-wider">{r.cardNo}</div>
        {r.reviewedAt && issuedLabel && <div className="text-[10px] text-navy-100">{issuedLabel}</div>}
      </div>
    </div>
  );
}

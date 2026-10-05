export function Logo({ src, size = 48 }: { src?: string; size?: number }) {
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt="logo" width={size} height={size} className="rounded-lg object-contain" style={{ width: size, height: size }} />;
  }
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden>
      <rect width="48" height="48" rx="10" fill="#0b3566" />
      <rect x="9" y="14" width="30" height="20" rx="3.5" fill="#1f6fd1" />
      <rect x="9" y="18" width="30" height="4" fill="#082a52" />
      <rect x="13" y="26" width="10" height="3" rx="1.5" fill="#e7b53b" />
    </svg>
  );
}

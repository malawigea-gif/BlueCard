"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useT } from "@/lib/i18n/client";
import type { DictKey } from "@/lib/i18n/dict";

const ITEMS: { href: string; label: DictKey; icon: string; badgeKey?: string }[] = [
  { href: "/admin", label: "admin.nav.dashboard", icon: "M3 13h8V3H3zM13 21h8V11h-8zM3 21h8v-6H3zM13 3v6h8V3z" },
  { href: "/admin/registrations", label: "admin.nav.registrations", icon: "M2 6h20v12H2zM2 10h20M6 15h4", badgeKey: "pending" },
  { href: "/admin/assessments", label: "admin.nav.assessments", icon: "M9 11l3 3 8-8M20 12v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h9" },
  { href: "/admin/payments", label: "admin.nav.payments", icon: "M18 6.5A7 7 0 1 0 18 17.5M4 10h10M4 14h10" },
  { href: "/admin/news", label: "admin.nav.news", icon: "M4 4h16v16H4zM8 8h8M8 12h8M8 16h5" },
  { href: "/admin/programs", label: "admin.nav.programs", icon: "M12 2l9 5-9 5-9-5zM3 12l9 5 9-5M3 17l9 5 9-5" },
  { href: "/admin/gallery", label: "admin.nav.gallery", icon: "M3 5h18v14H3zM3 16l5-5 4 4 3-3 6 6M15.5 9.5a1.5 1.5 0 1 0 0-.01" },
  { href: "/admin/about", label: "admin.nav.about", icon: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 16v-4M12 8h.01" },
  { href: "/admin/contact", label: "admin.nav.contact", icon: "M22 6l-10 7L2 6M2 4h20v16H2z" },
  { href: "/admin/messages", label: "admin.nav.messages", icon: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z", badgeKey: "unread" },
  { href: "/admin/users", label: "admin.nav.users", icon: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8" },
  { href: "/admin/settings", label: "admin.nav.settings", icon: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" },
];

export function AdminNav({ counts }: { counts: Record<string, number> }) {
  const path = usePathname();
  const t = useT();
  return (
    <nav className="flex gap-1 overflow-x-auto p-2 lg:flex-col lg:overflow-visible lg:p-3">
      {ITEMS.map((it) => {
        const active = it.href === "/admin" ? path === "/admin" : path.startsWith(it.href);
        const n = it.badgeKey ? counts[it.badgeKey] : 0;
        return (
          <Link key={it.href} href={it.href}
            className={`flex shrink-0 items-center gap-3 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition ${active ? "bg-white/15 text-white" : "text-navy-100 hover:bg-white/10 hover:text-white"}`}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={it.icon} /></svg>
            <span className="flex-1">{t(it.label)}</span>
            {n > 0 && <span className="rounded-full bg-gold-400 px-2 text-xs font-bold text-navy-900">{n}</span>}
          </Link>
        );
      })}
    </nav>
  );
}

"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useT } from "@/lib/i18n/client";
import type { DictKey } from "@/lib/i18n/dict";

const LINKS: { href: string; label: DictKey }[] = [
  { href: "/", label: "nav.home" },
  { href: "/programs", label: "nav.programs" },
  { href: "/news", label: "nav.news" },
  { href: "/about", label: "nav.about" },
  { href: "/contact", label: "nav.contact" },
];

export function NavLinks() {
  const path = usePathname();
  const t = useT();
  return (
    <ul className="flex overflow-x-auto text-sm font-medium">
      {LINKS.map((l) => {
        const active = l.href === "/" ? path === "/" : path.startsWith(l.href);
        return (
          <li key={l.href}>
            <Link
              href={l.href}
              className={`block whitespace-nowrap border-b-2 px-4 py-3 transition ${
                active ? "border-gold-400 text-white" : "border-transparent text-navy-100 hover:text-white"
              }`}
            >
              {t(l.label)}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

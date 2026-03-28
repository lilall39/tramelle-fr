"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/outils", label: "Outils" },
  { href: "/articles", label: "Articles" },
  { href: "/billets", label: "Billets" },
] as const;

function isActivePath(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteNav() {
  const pathname = usePathname();

  return (
    <nav
      className="flex flex-wrap items-center gap-x-1 gap-y-2 sm:gap-x-2"
      aria-label="Navigation principale"
    >
      {items.map((item) => {
        const active = isActivePath(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`border-b-2 px-2.5 py-1.5 text-sm font-medium transition-colors sm:px-3 ${
              active
                ? "border-accent text-ink"
                : "border-transparent text-ink/65 hover:border-ink/15 hover:text-ink"
            }`}
            aria-current={active ? "page" : undefined}
          >
            {item.label}
          </Link>
        );
      })}
      <span className="hidden text-ink/25 sm:inline" aria-hidden>
        ·
      </span>
      <Link
        href="/a-propos"
        className={`border-b-2 px-2.5 py-1.5 text-sm transition-colors sm:px-3 ${
          pathname === "/a-propos"
            ? "border-accent font-medium text-ink"
            : "border-transparent text-ink/45 hover:border-ink/15 hover:text-ink/85"
        }`}
        aria-current={pathname === "/a-propos" ? "page" : undefined}
      >
        À propos
      </Link>
    </nav>
  );
}

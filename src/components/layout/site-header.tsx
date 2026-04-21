"use client";

import Link from "next/link";
import { brand, siteDomain } from "@/lib/site";
import { Suspense, useState } from "react";
import { usePathname } from "next/navigation";
import { AuthLinks } from "@/components/layout/auth-links";

const navItems = [
  { href: "/publications", label: "Publications" },
  { href: "/outils", label: "Outils" },
  { href: "/billets", label: "Billets" },
] as const;

function isActivePath(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function HamburgerIcon({ open }: { open: boolean }) {
  return (
    <span className="flex h-5 w-6 flex-col justify-center gap-[5px]" aria-hidden>
      <span
        className={`h-0.5 w-full rounded-full bg-ink transition-transform duration-200 ${open ? "translate-y-[7px] rotate-45" : ""}`}
      />
      <span className={`h-0.5 w-full rounded-full bg-ink transition-opacity duration-200 ${open ? "opacity-0" : "opacity-100"}`} />
      <span
        className={`h-0.5 w-full rounded-full bg-ink transition-transform duration-200 ${open ? "-translate-y-[7px] -rotate-45" : ""}`}
      />
    </span>
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-ink/[0.08] bg-white shadow-sm shadow-ink/[0.03] backdrop-blur-md dark:border-ink/[0.12] dark:bg-paper-elevated/98 dark:shadow-black/20">
      <div className="mx-auto max-w-6xl px-5 py-5 md:py-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between md:gap-5">
          <div className="flex items-start justify-between gap-4 md:block md:max-w-md">
            <Link
              href="/"
              className="group inline-flex max-w-md flex-col gap-1.5 underline-offset-4 transition-colors"
              aria-label={`${brand.kicker}, accueil`}
              onClick={() => setMenuOpen(false)}
            >
              <span className="font-editorial-serif text-[1.75rem] font-bold leading-none tracking-tight text-terracotta transition-colors group-hover:text-ink md:text-[1.95rem]">
                {brand.kicker}
              </span>
              <span className="text-[0.8rem] font-bold uppercase tracking-[0.28em] text-terracotta/75 transition-colors group-hover:text-ink/65">
                {siteDomain}
              </span>
            </Link>
            <button
              type="button"
              className="shrink-0 rounded-md p-2 text-ink md:hidden"
              aria-expanded={menuOpen}
              aria-controls="menu-principal"
              aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
              onClick={() => setMenuOpen((o) => !o)}
            >
              <HamburgerIcon open={menuOpen} />
            </button>
          </div>

          <nav
            id="menu-principal"
            className={`flex-col gap-0 rounded-lg border border-ink/[0.08] bg-white p-2 shadow-sm dark:border-ink/[0.1] dark:bg-paper md:flex md:flex-row md:flex-wrap md:items-center md:gap-x-1 md:gap-y-2 md:border-0 md:bg-transparent md:p-0 md:shadow-none ${
              menuOpen ? "flex" : "hidden md:flex"
            }`}
            aria-label="Navigation principale"
          >
            {navItems.map((item) => {
              const active = isActivePath(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-md border-b-2 border-transparent px-3 py-3 text-base font-bold transition-colors md:border-b-2 md:px-3 md:py-1.5 ${
                    active
                      ? "bg-paper-muted/80 text-ink md:border-accent md:bg-transparent"
                      : "text-ink/65 hover:bg-paper-muted/50 hover:text-ink md:hover:bg-transparent md:hover:border-terracotta/30"
                  }`}
                  aria-current={active ? "page" : undefined}
                  onClick={() => setMenuOpen(false)}
                >
                  {item.label}
                </Link>
              );
            })}
            <span className="hidden px-1 text-base text-ink/25 md:inline" aria-hidden>
              ·
            </span>
            <Link
              href="/a-propos"
              className={`rounded-md border-b-2 border-transparent px-3 py-3 text-base font-bold transition-colors md:border-b-2 md:px-3 md:py-1.5 ${
                pathname === "/a-propos"
                  ? "bg-paper-muted/80 text-ink md:border-accent md:bg-transparent"
                  : "text-ink/45 hover:bg-paper-muted/50 hover:text-ink/85 md:hover:bg-transparent md:hover:border-terracotta/35"
              }`}
              aria-current={pathname === "/a-propos" ? "page" : undefined}
              onClick={() => setMenuOpen(false)}
            >
              À propos
            </Link>
            <span className="hidden px-1 text-base text-ink/25 md:inline" aria-hidden>
              ·
            </span>
            <Link
              href="/contact"
              className={`rounded-md border-b-2 border-transparent px-3 py-3 text-base font-bold transition-colors md:border-b-2 md:px-3 md:py-1.5 ${
                pathname === "/contact"
                  ? "bg-paper-muted/80 text-ink md:border-accent md:bg-transparent"
                  : "text-ink/65 hover:bg-paper-muted/50 hover:text-ink md:hover:bg-transparent md:hover:border-terracotta/30"
              }`}
              aria-current={pathname === "/contact" ? "page" : undefined}
              onClick={() => setMenuOpen(false)}
            >
              Contact
            </Link>
            <span className="hidden px-1 text-base text-ink/25 md:inline" aria-hidden>
              ·
            </span>
            <div className="flex flex-col md:flex-row md:flex-wrap md:items-center md:gap-x-1">
              <Suspense
                fallback={
                  <span className="px-3 py-3 text-sm text-ink/45 md:py-1.5" aria-hidden>
                    …
                  </span>
                }
              >
                <AuthLinks onNavigate={() => setMenuOpen(false)} />
              </Suspense>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}

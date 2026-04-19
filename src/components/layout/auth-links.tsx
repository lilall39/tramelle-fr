"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";

function linkClass(active: boolean) {
  return `rounded-md border-b-2 border-transparent px-3 py-3 text-base font-bold transition-colors md:border-b-2 md:px-3 md:py-1.5 ${
    active
      ? "bg-paper-muted/80 text-ink md:border-accent md:bg-transparent"
      : "text-ink/65 hover:bg-paper-muted/50 hover:text-ink md:hover:bg-transparent md:hover:border-terracotta/30"
  }`;
}

function chevronDownIcon(className: string) {
  return (
    <svg
      className={className}
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M2.5 4.5L6 8L9.5 4.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function AuthLinks({ onNavigate }: { onNavigate?: () => void }) {
  const { user, profile, loading, signOut } = useAuth();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (loading) {
    return (
      <span className="px-3 py-3 text-sm text-ink/45 md:py-1.5" aria-hidden>
        …
      </span>
    );
  }

  if (!user) {
    const next = searchParams.get("next");
    const onLoginPage = pathname === "/login";
    const publierLoginActif = onLoginPage && next === "/publier";
    const connexionSeuleActif = onLoginPage && next !== "/publier";

    const connexionItemClass = connexionSeuleActif
      ? "bg-paper-muted/90 text-ink"
      : "text-ink/80 hover:bg-paper-muted/70 hover:text-ink";

    return (
      <>
        {/* Mobile : repliable (pas de survol) */}
        <details className="open:[&_summary_svg]:rotate-180 md:hidden">
          <summary
            className={`list-none [&::-webkit-details-marker]:hidden ${linkClass(false)} flex cursor-pointer items-center justify-between gap-2`}
          >
            Publier
            {chevronDownIcon("h-4 w-4 shrink-0 text-ink/45 transition-transform duration-200")}
          </summary>
          <div
            className="ml-3 mt-1 space-y-0.5 border-l-2 border-terracotta/25 py-1 pl-4"
            role="group"
            aria-label="Connexion"
          >
            <Link
              href="/login?next=/publier"
              className={`block rounded-md py-2 text-sm font-bold ${publierLoginActif ? "text-ink" : "text-ink/65"}`}
              onClick={onNavigate}
            >
              Accès publication
            </Link>
            <Link
              href="/login"
              className={`block rounded-md py-2 text-sm font-bold ${connexionItemClass}`}
              onClick={onNavigate}
            >
              Connexion
            </Link>
          </div>
        </details>

        {/* Bureau : sous-menu au survol (et au clavier : focus dans le bloc) */}
        <div className="relative hidden md:inline-block">
          <div className="group relative">
            <Link
              href="/login?next=/publier"
              className={`${linkClass(publierLoginActif)} inline-flex items-center gap-1.5`}
              aria-haspopup="menu"
              onClick={onNavigate}
            >
              Publier
              {chevronDownIcon("h-3.5 w-3.5 shrink-0 text-ink/40")}
            </Link>
            <div
              className="pointer-events-none absolute left-0 top-full z-[60] min-w-[12rem] pt-2 opacity-0 transition-opacity duration-150 group-hover:pointer-events-auto group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:opacity-100"
              role="menu"
              aria-label="Menu Publier"
            >
              <div className="rounded-lg border border-ink/[0.1] bg-white py-1 shadow-lg dark:border-ink/[0.14] dark:bg-paper-elevated dark:shadow-black/25">
                <Link
                  href="/login"
                  role="menuitem"
                  className={`block px-4 py-2.5 text-sm font-bold transition-colors ${connexionSeuleActif ? "bg-paper-muted/80 text-ink" : "text-ink/75 hover:bg-paper-muted/60 hover:text-ink"}`}
                  onClick={onNavigate}
                >
                  Connexion
                </Link>
              </div>
            </div>
          </div>
        </div>

        <Link
          href="/signup"
          className={linkClass(pathname === "/signup")}
          onClick={onNavigate}
        >
          Inscription
        </Link>
      </>
    );
  }

  return (
    <>
      <Link
        href="/publier"
        className={linkClass(pathname === "/publier")}
        onClick={onNavigate}
      >
        Publier
      </Link>
      <Link
        href="/mes-publications"
        className={linkClass(pathname === "/mes-publications")}
        onClick={onNavigate}
      >
        Mes publications
      </Link>
      <Link
        href="/mon-compte"
        className={linkClass(pathname === "/mon-compte")}
        onClick={onNavigate}
      >
        Mon compte
      </Link>
      {profile?.role === "admin" ? (
        <Link
          href="/admin"
          className={linkClass(pathname.startsWith("/admin"))}
          onClick={onNavigate}
        >
          Admin
        </Link>
      ) : null}
      <button
        type="button"
        className="rounded-md px-3 py-3 text-left text-base font-bold text-ink/55 hover:bg-paper-muted/50 hover:text-ink md:py-1.5"
        onClick={() => {
          onNavigate?.();
          void signOut();
        }}
      >
        Déconnexion
      </button>
    </>
  );
}

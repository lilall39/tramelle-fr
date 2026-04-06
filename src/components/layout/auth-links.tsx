"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";

function linkClass(active: boolean) {
  return `rounded-md border-b-2 border-transparent px-3 py-3 text-base font-bold transition-colors md:border-b-2 md:px-3 md:py-1.5 ${
    active
      ? "bg-paper-muted/80 text-ink md:border-accent md:bg-transparent"
      : "text-ink/65 hover:bg-paper-muted/50 hover:text-ink md:hover:bg-transparent md:hover:border-terracotta/30"
  }`;
}

export function AuthLinks({ onNavigate }: { onNavigate?: () => void }) {
  const { user, profile, loading, signOut } = useAuth();
  const pathname = usePathname();

  if (loading) {
    return (
      <span className="px-3 py-3 text-sm text-ink/45 md:py-1.5" aria-hidden>
        …
      </span>
    );
  }

  if (!user) {
    return (
      <>
        <Link
          href="/login"
          className={linkClass(pathname === "/login")}
          onClick={onNavigate}
        >
          Connexion
        </Link>
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

"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { PageContainer } from "@/components/layout/page-container";

export default function MonComptePage() {
  const { user, profile, loading, signOut } = useAuth();

  if (loading) {
    return (
      <PageContainer>
        <p className="text-sm text-ink/55">Chargement…</p>
      </PageContainer>
    );
  }

  if (!user) {
    return (
      <PageContainer className="max-w-lg">
        <h1 className="font-editorial-serif text-3xl font-bold text-ink">Mon compte</h1>
        <p className="mt-4 text-sm text-ink/65">
          <Link href="/login" className="font-bold text-terracotta underline">
            Connectez-vous
          </Link>{" "}
          pour accéder à votre espace.
        </p>
      </PageContainer>
    );
  }

  return (
    <PageContainer className="max-w-lg">
      <h1 className="font-editorial-serif text-3xl font-bold text-ink">Mon compte</h1>
      <dl className="mt-8 space-y-4 text-sm">
        <div>
          <dt className="font-bold text-ink/50">E-mail</dt>
          <dd className="mt-1 text-ink">{profile?.email ?? user.email}</dd>
        </div>
        <div>
          <dt className="font-bold text-ink/50">Nom affiché</dt>
          <dd className="mt-1 text-ink">{profile?.displayName ?? "—"}</dd>
        </div>
        <div>
          <dt className="font-bold text-ink/50">Rôle</dt>
          <dd className="mt-1 text-ink">{profile?.role ?? "—"}</dd>
        </div>
      </dl>
      <ul className="mt-10 flex flex-wrap gap-4 text-sm font-bold">
        <li>
          <Link href="/mes-publications" className="text-terracotta underline">
            Mes publications
          </Link>
        </li>
        <li>
          <Link href="/publier" className="text-terracotta underline">
            Publier
          </Link>
        </li>
      </ul>
      <button
        type="button"
        className="mt-10 text-sm font-bold text-ink/55 underline"
        onClick={() => void signOut()}
      >
        Se déconnecter
      </button>
    </PageContainer>
  );
}

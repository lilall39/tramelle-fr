"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { PageContainer } from "@/components/layout/page-container";

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login?next=/admin");
      return;
    }
    if (profile && profile.role !== "admin") {
      router.replace("/");
    }
  }, [loading, user, profile, router]);

  if (loading || !user) {
    return (
      <PageContainer className="py-16">
        <p className="text-sm text-ink/60">Vérification des droits…</p>
      </PageContainer>
    );
  }

  if (profile?.role !== "admin") {
    return (
      <PageContainer className="py-16">
        <p className="text-sm text-ink/70">
          Accès réservé aux administrateurs.{" "}
          <Link href="/" className="font-bold text-terracotta underline">
            Retour à l’accueil
          </Link>
        </p>
      </PageContainer>
    );
  }

  return <>{children}</>;
}

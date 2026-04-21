"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { PageContainer } from "@/components/layout/page-container";

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login?next=/publier");
    }
  }, [loading, user, router]);

  if (loading) {
    return (
      <PageContainer className="py-16">
        <p className="text-sm text-ink/60">Chargement…</p>
      </PageContainer>
    );
  }

  if (!user) {
    return (
      <PageContainer className="py-16">
        <p className="text-sm text-ink/70">
          Redirection vers la connexion… Sinon,{" "}
          <Link href="/login" className="font-bold text-terracotta underline">
            se connecter
          </Link>
          .
        </p>
      </PageContainer>
    );
  }

  return <>{children}</>;
}

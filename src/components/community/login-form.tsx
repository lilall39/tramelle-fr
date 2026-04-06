"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { PageContainer } from "@/components/layout/page-container";

export function LoginForm() {
  const { signIn } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawNext = searchParams.get("next") || "/mon-compte";
  const next = rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/mon-compte";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      await signIn(email, password);
      router.replace(next);
      router.refresh();
    } catch {
      setError("E-mail ou mot de passe incorrect.");
    } finally {
      setPending(false);
    }
  }

  return (
    <PageContainer className="max-w-md">
      <h1 className="font-editorial-serif text-3xl font-bold text-ink">Connexion</h1>
      <p className="mt-2 text-sm text-ink/60">
        Pas encore de compte ?{" "}
        <Link href="/signup" className="font-bold text-terracotta underline">
          S’inscrire
        </Link>
      </p>
      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <label className="block text-sm font-bold text-ink">
          E-mail
          <input
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(ev) => setEmail(ev.target.value)}
            className="mt-1 w-full rounded-md border border-ink/[0.12] bg-white px-3 py-2 text-sm dark:bg-paper-elevated"
          />
        </label>
        <label className="block text-sm font-bold text-ink">
          Mot de passe
          <input
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(ev) => setPassword(ev.target.value)}
            className="mt-1 w-full rounded-md border border-ink/[0.12] bg-white px-3 py-2 text-sm dark:bg-paper-elevated"
          />
        </label>
        {error ? <p className="text-sm font-bold text-red-700 dark:text-red-400">{error}</p> : null}
        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-md bg-ink py-2.5 text-sm font-bold text-paper transition hover:opacity-90 disabled:opacity-50"
        >
          {pending ? "Connexion…" : "Se connecter"}
        </button>
      </form>
    </PageContainer>
  );
}

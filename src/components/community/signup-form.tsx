"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { PageContainer } from "@/components/layout/page-container";

export function SignupForm() {
  const { signUp } = useAuth();
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }
    setPending(true);
    try {
      await signUp(email, password, displayName.trim() || email.split("@")[0] || "Utilisateur");
      router.replace("/mon-compte");
      router.refresh();
    } catch {
      setError("Inscription impossible (e-mail déjà utilisé ou erreur réseau).");
    } finally {
      setPending(false);
    }
  }

  return (
    <PageContainer className="max-w-md">
      <h1 className="font-editorial-serif text-3xl font-bold text-ink">Créer un compte</h1>
      <p className="mt-2 text-sm text-ink/60">
        Déjà inscrit ?{" "}
        <Link href="/login" className="font-bold text-terracotta underline">
          Se connecter
        </Link>
      </p>
      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <label className="block text-sm font-bold text-ink">
          Nom affiché
          <input
            required
            value={displayName}
            onChange={(ev) => setDisplayName(ev.target.value)}
            className="mt-1 w-full rounded-md border border-ink/[0.12] bg-white px-3 py-2 text-sm dark:bg-paper-elevated"
          />
        </label>
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
            autoComplete="new-password"
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
          {pending ? "Création…" : "S’inscrire"}
        </button>
      </form>
    </PageContainer>
  );
}

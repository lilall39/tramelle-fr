import { LoginForm } from "@/components/community/login-form";
import { Suspense } from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Connexion",
  description: "Connexion à votre compte Tramelle pour publier et gérer vos annonces.",
};

export default function LoginPage() {
  return (
    <Suspense fallback={<p className="mx-auto max-w-6xl px-5 py-16 text-sm text-ink/55">Chargement…</p>}>
      <LoginForm />
    </Suspense>
  );
}

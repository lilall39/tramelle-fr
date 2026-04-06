"use client";

import { useEffect, useMemo, useState } from "react";
import type { PublicSubmission, SubmissionCategory } from "@/types/community";
import { listApprovedPublications } from "@/lib/community/submissions";
import { PublicationCard } from "@/components/community/publication-card";
import { CATEGORY_LABELS } from "@/lib/community/labels";
import { PageContainer } from "@/components/layout/page-container";

const ALL = "all" as const;

export function PublicationsListClient() {
  const [filter, setFilter] = useState<typeof ALL | SubmissionCategory>(ALL);
  const [all, setAll] = useState<PublicSubmission[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const items = useMemo(() => {
    if (!all) return null;
    if (filter === ALL) return all;
    return all.filter((r) => r.category === filter);
  }, [all, filter]);

  useEffect(() => {
    let cancelled = false;
    listApprovedPublications()
      .then((data) => {
        if (!cancelled) {
          setError(null);
          setAll(data);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          const code =
            err && typeof err === "object" && "code" in err ? String((err as { code: string }).code) : "";
          const message = err instanceof Error ? err.message : "";
          let detail = " Vérifiez les variables NEXT_PUBLIC_FIREBASE_* et le déploiement des règles Firestore.";
          if (code === "permission-denied") {
            detail = " Firestore a refusé la lecture (règles de sécurité ou projet incorrect).";
          } else if (code === "failed-precondition") {
            detail = " Index Firestore manquant — ouvrez le lien proposé dans la console Firebase.";
          } else if (message.includes("Firebase non initialisé")) {
            detail = " Firebase n’est pas initialisé côté navigateur (clés manquantes dans .env.local).";
          }
          setError(`Impossible de charger les publications.${detail}`);
          setAll([]);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <PageContainer>
      <header className="max-w-2xl space-y-3">
        <h1 className="font-editorial-serif text-3xl font-bold tracking-tight text-ink sm:text-4xl">Publications</h1>
        <p className="text-sm leading-relaxed text-ink/65">
          Annonces, services, ventes, dons et articles — modérés avant mise en ligne.
        </p>
      </header>

      <div className="mt-8 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setFilter(ALL)}
          className={`rounded-full px-3 py-1.5 text-sm font-bold transition ${
            filter === ALL
              ? "bg-ink text-paper"
              : "bg-paper-muted text-ink/70 hover:bg-paper-muted/80"
          }`}
        >
          Tout
        </button>
        {(Object.keys(CATEGORY_LABELS) as SubmissionCategory[]).map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setFilter(cat)}
            className={`rounded-full px-3 py-1.5 text-sm font-bold transition ${
              filter === cat
                ? "bg-ink text-paper"
                : "bg-paper-muted text-ink/70 hover:bg-paper-muted/80"
            }`}
          >
            {CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>

      {error ? <p className="mt-8 text-sm text-red-700 dark:text-red-400">{error}</p> : null}

      {items === null ? (
        <p className="mt-10 text-sm text-ink/55">Chargement…</p>
      ) : error ? null : items.length === 0 ? (
        <p className="mt-10 text-sm text-ink/55">Aucune publication pour ce filtre.</p>
      ) : (
        <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((s) => (
            <li key={s.id}>
              <PublicationCard submission={s} />
            </li>
          ))}
        </ul>
      )}
    </PageContainer>
  );
}

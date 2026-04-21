"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { deleteSubmission, listMySubmissions } from "@/lib/community/submissions";
import type { Submission } from "@/types/community";
import { CATEGORY_LABELS, STATUS_LABELS } from "@/lib/community/labels";
import { formatFirestoreDate } from "@/lib/community/format-date";
import { firebaseErrorHint } from "@/lib/firebase/error-hint";
import { PageContainer } from "@/components/layout/page-container";

export function MesPublicationsClient() {
  const { user } = useAuth();
  const [rows, setRows] = useState<(Submission & { id: string })[] | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  function reload() {
    if (!user) return;
    listMySubmissions(user.uid)
      .then(setRows)
      .catch(() => setRows([]));
  }

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    listMySubmissions(user.uid)
      .then((data) => {
        if (!cancelled) setRows(data);
      })
      .catch(() => {
        if (!cancelled) setRows([]);
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  async function remove(id: string) {
    if (!window.confirm("Supprimer définitivement cette publication ?")) return;
    setDeleteError(null);
    setDeletingId(id);
    try {
      await deleteSubmission(id);
      setRows((prev) => (prev ? prev.filter((s) => s.id !== id) : prev));
      reload();
    } catch (e) {
      setDeleteError(firebaseErrorHint(e));
    } finally {
      setDeletingId(null);
    }
  }

  if (!user) {
    return (
      <PageContainer>
        <p className="text-sm text-ink/65">
          <Link href="/login" className="font-bold text-terracotta underline">
            Connectez-vous
          </Link>
        </p>
      </PageContainer>
    );
  }

  if (rows === null) {
    return (
      <PageContainer>
        <p className="text-sm text-ink/55">Chargement…</p>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <h1 className="font-editorial-serif text-3xl font-bold text-ink">Mes publications</h1>
      <p className="mt-2 max-w-xl text-sm text-ink/60">
        Seules les publications approuvées sont visibles par tout le monde. Les brouillons modérés restent ici.
      </p>
      {deleteError ? (
        <p className="mt-6 max-w-xl rounded-lg border border-red-300/80 bg-red-50 px-4 py-3 text-sm text-red-900 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
          {deleteError}
        </p>
      ) : null}
      {rows.length === 0 ? (
        <p className="mt-10 text-sm text-ink/55">
          Aucune soumission pour l’instant.{" "}
          <Link href="/publier" className="font-bold text-terracotta underline">
            Publier
          </Link>
        </p>
      ) : (
        <ul className="mt-10 space-y-4">
          {rows.map((s) => (
            <li
              key={s.id}
              className="rounded-xl border border-ink/[0.08] bg-white p-4 dark:border-ink/[0.12] dark:bg-paper-elevated"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="font-editorial-serif text-lg font-bold text-ink">{s.title}</h2>
                <span className="text-xs font-bold uppercase tracking-wider text-terracotta">{CATEGORY_LABELS[s.category]}</span>
              </div>
              <p className="mt-1 text-xs text-ink/50">
                {STATUS_LABELS[s.status]} · {formatFirestoreDate(s.createdAt)}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-4">
                {s.status === "approved" ? (
                  <Link href={`/publications/${s.id}`} className="text-sm font-bold text-terracotta underline">
                    Voir la page publique
                  </Link>
                ) : null}
                <button
                  type="button"
                  disabled={deletingId === s.id}
                  onClick={() => void remove(s.id)}
                  className="text-sm font-bold text-red-700 underline decoration-red-700/40 underline-offset-2 hover:text-red-800 disabled:opacity-50 dark:text-red-400"
                >
                  {deletingId === s.id ? "Suppression…" : "Supprimer"}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </PageContainer>
  );
}

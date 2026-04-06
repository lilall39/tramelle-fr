"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { notFound } from "next/navigation";
import { deleteSubmission, getSubmissionByIdFull, updateSubmissionStatus } from "@/lib/community/submissions";
import type { Submission } from "@/types/community";
import { CATEGORY_LABELS } from "@/lib/community/labels";
import { formatFirestoreDate } from "@/lib/community/format-date";
import { firebaseErrorHint } from "@/lib/firebase/error-hint";
import { PageContainer } from "@/components/layout/page-container";

type Props = { id: string };

export function AdminModerationDetail({ id }: Props) {
  const router = useRouter();
  const [data, setData] = useState<(Submission & { id: string }) | null | undefined>(undefined);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getSubmissionByIdFull(id)
      .then((doc) => {
        if (!cancelled) setData(doc);
      })
      .catch(() => {
        if (!cancelled) setData(null);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  async function setStatus(next: "approved" | "rejected") {
    if (!data) return;
    setActionError(null);
    setBusy(true);
    try {
      await updateSubmissionStatus(data.id, next);
      router.replace("/admin/moderation");
      router.refresh();
    } catch (e) {
      setActionError(firebaseErrorHint(e));
    } finally {
      setBusy(false);
    }
  }

  async function removeSubmission() {
    if (!data) return;
    if (!window.confirm("Supprimer définitivement cette publication ?")) return;
    setActionError(null);
    setBusy(true);
    try {
      await deleteSubmission(data.id);
      router.replace("/admin/moderation");
      router.refresh();
    } catch (e) {
      setActionError(firebaseErrorHint(e));
    } finally {
      setBusy(false);
    }
  }

  if (data === undefined) {
    return (
      <PageContainer>
        <p className="text-sm text-ink/55">Chargement…</p>
      </PageContainer>
    );
  }

  if (data === null) {
    notFound();
  }

  const s = data;

  return (
    <PageContainer>
      <p className="text-sm">
        <Link href="/admin/moderation" className="font-bold text-terracotta underline">
          ← Retour à la liste
        </Link>
      </p>
      <p className="mt-6 text-xs font-bold uppercase tracking-[0.22em] text-terracotta">{CATEGORY_LABELS[s.category]}</p>
      <h1 className="mt-2 font-editorial-serif text-3xl font-bold text-ink">{s.title}</h1>
      <p className="mt-2 text-sm text-ink/55">{formatFirestoreDate(s.createdAt)}</p>

      {actionError ? (
        <p className="mt-6 max-w-xl rounded-lg border border-red-300/80 bg-red-50 px-4 py-3 text-sm text-red-900 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
          {actionError}
        </p>
      ) : null}

      <section className="mt-8 rounded-xl border border-amber-200/80 bg-amber-50/50 p-4 text-sm dark:border-amber-900/40 dark:bg-amber-950/30">
        <h2 className="font-bold text-ink">Données privées (modération)</h2>
        <ul className="mt-2 space-y-1 text-ink/85">
          <li>Nom : {s.privateName}</li>
          <li>E-mail : {s.privateEmail}</li>
          <li>Tél. : {s.privatePhone || "—"}</li>
        </ul>
      </section>

      <section className="mt-6 space-y-2 text-sm">
        <p>
          <span className="font-bold">Auteur public :</span> {s.displayName}
        </p>
        <p>
          <span className="font-bold">Ville :</span> {s.city}
        </p>
        <div className="whitespace-pre-wrap pt-2 text-ink/85">{s.description}</div>
      </section>

      {s.status === "pending" ? (
        <div className="mt-10 flex flex-wrap gap-3">
          <button
            type="button"
            disabled={busy}
            onClick={() => void setStatus("approved")}
            className="rounded-md bg-ink px-4 py-2 text-sm font-bold text-paper disabled:opacity-50"
          >
            Approuver
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => void setStatus("rejected")}
            className="rounded-md border border-ink/[0.2] px-4 py-2 text-sm font-bold text-ink disabled:opacity-50"
          >
            Refuser
          </button>
        </div>
      ) : (
        <p className="mt-8 text-sm font-bold text-ink/55">Statut : {s.status}</p>
      )}

      <div className="mt-8 border-t border-ink/[0.08] pt-8">
        <button
          type="button"
          disabled={busy}
          onClick={() => void removeSubmission()}
          className="text-sm font-bold text-red-700 underline decoration-red-700/40 underline-offset-2 hover:text-red-800 disabled:opacity-50 dark:text-red-400"
        >
          Supprimer définitivement
        </button>
      </div>
    </PageContainer>
  );
}

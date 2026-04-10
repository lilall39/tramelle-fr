"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { notFound } from "next/navigation";
import {
  applyModerationAction,
  getSubmissionByIdFull,
  permanentlyDeleteSubmissionForModeration,
} from "@/lib/community/submissions";
import type { Submission } from "@/types/community";
import { CATEGORY_LABELS, STATUS_LABELS } from "@/lib/community/labels";
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

  async function runModeration(action: "approve" | "reject" | "delete") {
    if (!data) return;
    if (action === "delete" && !window.confirm("Archiver cette publication (statut supprimé) ?")) return;
    setActionError(null);
    setBusy(true);
    try {
      await applyModerationAction(data.id, data, action);
      router.replace("/admin/moderation");
      router.refresh();
    } catch (e) {
      setActionError(e instanceof Error ? e.message : firebaseErrorHint(e));
    } finally {
      setBusy(false);
    }
  }

  async function runPermanentDelete() {
    if (!data) return;
    if (
      !window.confirm(
        "Effacer définitivement cette publication et tous les commentaires associés ? Cette action est irréversible.",
      )
    ) {
      return;
    }
    setActionError(null);
    setBusy(true);
    try {
      await permanentlyDeleteSubmissionForModeration(data.id);
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
  /** Même source que le flux /publier : image principale + couverture article (souvent identiques). */
  const moderationImageUrl = s.imageUrl ?? s.coverImage ?? null;

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

      {s.category === "article" ? (
        <section className="mt-6 space-y-3 text-sm">
          {s.subtitle ? (
            <p>
              <span className="font-bold">Sous-titre :</span> {s.subtitle}
            </p>
          ) : null}
          <div>
            <p className="font-bold text-ink">Corps de l’article</p>
            <div className="mt-2 whitespace-pre-wrap rounded-xl border border-ink/[0.08] bg-paper-muted/30 p-4 text-ink/90">
              {s.content?.trim() ? s.content : "Aucun corps d’article saisi."}
            </div>
          </div>
        </section>
      ) : null}

      {moderationImageUrl ? (
        <section className="mt-6" aria-label="Image du billet">
          <p className="text-sm font-bold text-ink">Image</p>
          <div className="mt-2 max-w-xs overflow-hidden rounded-xl border border-ink/[0.1] bg-paper-muted/30">
            {/* eslint-disable-next-line @next/next/no-img-element -- URL Firebase Storage, domaine dynamique */}
            <img
              src={moderationImageUrl}
              alt=""
              className="max-h-48 w-full object-contain"
            />
          </div>
        </section>
      ) : null}

      <p className="mt-8 text-sm font-bold text-ink/55">Statut : {STATUS_LABELS[s.status] ?? s.status}</p>

      {s.status === "pending" ? (
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            disabled={busy}
            onClick={() => void runModeration("approve")}
            className="rounded-md bg-ink px-4 py-2 text-sm font-bold text-paper disabled:opacity-50"
          >
            Approuver
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => void runModeration("reject")}
            className="rounded-md border border-ink/[0.2] px-4 py-2 text-sm font-bold text-ink disabled:opacity-50"
          >
            Refuser
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => void runModeration("delete")}
            className="rounded-md border border-red-300/80 px-4 py-2 text-sm font-bold text-red-800 disabled:opacity-50 dark:border-red-900/50 dark:text-red-300"
          >
            Supprimer
          </button>
        </div>
      ) : s.status === "deleted" ? (
        <div className="mt-6 flex flex-col gap-4">
          <p className="text-xs text-ink/50">
            Cette publication est archivée. Pour effacer définitivement la fiche et les commentaires en base :
          </p>
          <button
            type="button"
            disabled={busy}
            onClick={() => void runPermanentDelete()}
            className="self-start rounded-md border border-red-300/80 px-4 py-2 text-sm font-bold text-red-800 disabled:opacity-50 dark:border-red-900/50 dark:text-red-300"
          >
            Effacer définitivement
          </button>
        </div>
      ) : (
        <div className="mt-6 flex flex-col gap-4">
          <button
            type="button"
            disabled={busy}
            onClick={() => void runModeration("delete")}
            className="text-sm font-bold text-red-700 underline decoration-red-700/40 underline-offset-2 hover:text-red-800 disabled:opacity-50 dark:text-red-400"
          >
            Supprimer (archiver)
          </button>
          <p className="text-xs text-ink/50">
            L’archivage retire la publication du site. Pour effacer complètement la fiche et les commentaires en base :
          </p>
          <button
            type="button"
            disabled={busy}
            onClick={() => void runPermanentDelete()}
            className="self-start rounded-md border border-red-300/80 px-4 py-2 text-sm font-bold text-red-800 disabled:opacity-50 dark:border-red-900/50 dark:text-red-300"
          >
            Effacer définitivement
          </button>
        </div>
      )}
    </PageContainer>
  );
}

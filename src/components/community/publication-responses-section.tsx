"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import type { Response } from "@/types/community";
import { useAuth } from "@/contexts/auth-context";
import { createResponse, listResponsesForPublicDisplay } from "@/lib/community/responses";
import { formatMsDate } from "@/lib/community/format-date";
import { firebaseErrorHint } from "@/lib/firebase/error-hint";

type Props = {
  parentSubmissionId: string;
  className?: string;
  /** Liste vide compacte + pas de grande carte vide */
  compact?: boolean;
};

export function PublicationResponsesSection({ parentSubmissionId, className, compact }: Props) {
  const { user } = useAuth();
  const [rows, setRows] = useState<Response[] | null>(null);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    listResponsesForPublicDisplay(parentSubmissionId)
      .then(setRows)
      .catch(() => setRows([]));
  }, [parentSubmissionId]);

  useEffect(() => {
    load();
  }, [load]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user?.uid) return;
    setError(null);
    setSending(true);
    try {
      await createResponse(parentSubmissionId, draft, user.uid);
      setDraft("");
      load();
    } catch (err) {
      setError(firebaseErrorHint(err));
    } finally {
      setSending(false);
    }
  }

  const shell = className ?? (compact ? "mt-6 border-t border-ink/[0.08] pt-5" : "mt-12 border-t border-ink/[0.08] pt-10");

  if (rows === null) {
    return (
      <section className={shell} aria-labelledby="reponses-title">
        <h2 id="reponses-title" className={`font-editorial-serif font-bold text-ink ${compact ? "text-base" : "text-xl"}`}>
          Réponses
        </h2>
        <p className={`text-ink/55 ${compact ? "mt-1 text-xs" : "mt-2 text-sm"}`}>Chargement…</p>
      </section>
    );
  }

  const intro = compact ? null : (
    <p className="mt-2 max-w-2xl text-sm text-ink/60">
      Les réponses sont publiées après modération. Seules les réponses approuvées apparaissent ici.
    </p>
  );

  const emptyBlock =
    compact && rows.length === 0 ? (
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-ink/[0.06] bg-paper-muted/20 px-3 py-2.5">
        <p className="text-sm text-ink/55">Pas encore de réponse publique.</p>
        {user ? (
          <span className="text-xs font-bold text-ink/45">Utilisez le champ ci-dessous</span>
        ) : (
          <Link
            href={`/login?next=/publications/${parentSubmissionId}`}
            className="shrink-0 rounded-lg bg-ink px-3 py-1.5 text-xs font-bold text-paper transition hover:opacity-95"
          >
            Répondre
          </Link>
        )}
      </div>
    ) : rows.length === 0 ? (
      <p className="mt-6 text-sm text-ink/50">Aucune réponse publiée pour l’instant.</p>
    ) : null;

  return (
    <section className={shell} aria-labelledby="reponses-title">
      <h2 id="reponses-title" className={`font-editorial-serif font-bold text-ink ${compact ? "text-base" : "text-xl"}`}>
        Réponses
      </h2>
      {intro}
      {rows.length > 0 ? (
        <ul className={compact ? "mt-3 space-y-3" : "mt-6 space-y-4"}>
          {rows.map((r) => (
            <li
              key={r.id}
              className={`rounded-lg border border-ink/[0.08] bg-paper-muted/30 text-sm dark:border-ink/[0.12] ${compact ? "p-3" : "p-4"}`}
            >
              <p className="whitespace-pre-wrap text-ink/90">{r.content}</p>
              <p className="mt-1.5 text-xs text-ink/45">{formatMsDate(r.createdAt)}</p>
            </li>
          ))}
        </ul>
      ) : null}

      {emptyBlock}

      {user ? (
        <form onSubmit={(e) => void onSubmit(e)} className={`space-y-2 ${compact ? "mt-4" : "mt-8 space-y-3"}`}>
          <label className="block text-sm font-bold text-ink" htmlFor="response-draft">
            Ajouter une réponse
          </label>
          <textarea
            id="response-draft"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={compact ? 3 : 4}
            className="w-full rounded-md border border-ink/[0.12] bg-white px-3 py-2 text-sm dark:bg-paper-elevated"
            placeholder="Votre message…"
            maxLength={10000}
          />
          {error ? <p className="text-sm font-bold text-red-700 dark:text-red-400">{error}</p> : null}
          <button
            type="submit"
            disabled={sending || !draft.trim()}
            className="rounded-md bg-ink px-4 py-2 text-sm font-bold text-paper disabled:opacity-50"
          >
            {sending ? "Envoi…" : "Envoyer pour modération"}
          </button>
        </form>
      ) : !(compact && rows.length === 0) ? (
        <p className={`text-ink/65 ${compact ? "mt-3 text-xs" : "mt-8 text-sm"}`}>
          <Link href={`/login?next=/publications/${parentSubmissionId}`} className="font-bold text-terracotta underline">
            Connectez-vous
          </Link>{" "}
          pour proposer une réponse (soumise à modération).
        </p>
      ) : null}
    </section>
  );
}

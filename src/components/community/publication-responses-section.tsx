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
};

export function PublicationResponsesSection({ parentSubmissionId }: Props) {
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

  if (rows === null) {
    return (
      <section className="mt-12 border-t border-ink/[0.08] pt-10" aria-labelledby="reponses-title">
        <h2 id="reponses-title" className="font-editorial-serif text-xl font-bold text-ink">
          Réponses
        </h2>
        <p className="mt-2 text-sm text-ink/55">Chargement…</p>
      </section>
    );
  }

  return (
    <section className="mt-12 border-t border-ink/[0.08] pt-10" aria-labelledby="reponses-title">
      <h2 id="reponses-title" className="font-editorial-serif text-xl font-bold text-ink">
        Réponses
      </h2>
      <p className="mt-2 max-w-2xl text-sm text-ink/60">
        Les réponses sont publiées après modération. Seules les réponses approuvées apparaissent ici.
      </p>

      <ul className="mt-6 space-y-4">
        {rows.map((r) => (
          <li key={r.id} className="rounded-xl border border-ink/[0.08] bg-paper-muted/30 p-4 text-sm dark:border-ink/[0.12]">
            <p className="whitespace-pre-wrap text-ink/90">{r.content}</p>
            <p className="mt-2 text-xs text-ink/45">{formatMsDate(r.createdAt)}</p>
          </li>
        ))}
      </ul>

      {rows.length === 0 ? <p className="mt-6 text-sm text-ink/50">Aucune réponse publiée pour l’instant.</p> : null}

      {user ? (
        <form onSubmit={(e) => void onSubmit(e)} className="mt-8 space-y-3">
          <label className="block text-sm font-bold text-ink" htmlFor="response-draft">
            Ajouter une réponse
          </label>
          <textarea
            id="response-draft"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={4}
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
      ) : (
        <p className="mt-8 text-sm text-ink/65">
          <Link href={`/login?next=/publications/${parentSubmissionId}`} className="font-bold text-terracotta underline">
            Connectez-vous
          </Link>{" "}
          pour proposer une réponse (soumise à modération).
        </p>
      )}
    </section>
  );
}

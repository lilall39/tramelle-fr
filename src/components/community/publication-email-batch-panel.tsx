"use client";

import { EMAIL_BATCH_MAX_RECIPIENTS } from "@core/email/constants";
import { useState } from "react";
import { useAuth } from "@/contexts/auth-context";

type Props = {
  publicationId: string;
};

export function PublicationEmailBatchPanel({ publicationId }: Props) {
  const { user } = useAuth();
  const [recipientsText, setRecipientsText] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    setMessage(null);
    setError(null);
    if (!user) {
      setError("Connectez-vous pour envoyer.");
      return;
    }
    setLoading(true);
    try {
      const token = await user.getIdToken();
      const res = await fetch(`/api/publications/${encodeURIComponent(publicationId)}/email-batch`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ recipientsText }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        result?: {
          succeeded: number;
          failed: number;
          results?: { to: string; ok: boolean; error?: string }[];
        };
      };
      if (!res.ok) {
        setError(data.error ?? "L’envoi n’a pas pu aboutir.");
        return;
      }
      if (data.result) {
        const { succeeded, failed, results } = data.result;
        const lines: string[] = [
          `Envoi terminé : ${succeeded} réussite(s)${failed ? `, ${failed} échec(s)` : ""}.`,
        ];
        if (failed > 0 && results?.length) {
          for (const r of results) {
            if (!r.ok && r.error) {
              lines.push(`${r.to} — ${r.error}`);
            }
          }
        }
        setMessage(lines.join("\n"));
      } else {
        setMessage("Envoi terminé.");
      }
    } catch {
      setError("Problème de connexion. Réessayez.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-4 rounded-xl border border-ink/[0.1] bg-paper-muted/30 p-4 dark:border-ink/[0.15]">
      <h3 className="text-xs font-bold uppercase tracking-wider text-ink/55">
        Partagez votre annonce par mail avec vos connaissances ou autres
      </h3>
      <p className="mt-2 text-xs leading-relaxed text-ink/60">
        Collez des adresses (séparées par des virgules ou des retours à la ligne).
      </p>
      <p className="mt-1 text-xs leading-relaxed text-ink/60">
        Maximum {EMAIL_BATCH_MAX_RECIPIENTS} destinataires par envoi.
      </p>
      <form onSubmit={(e) => void onSubmit(e)} className="mt-3 space-y-2">
        <label htmlFor={`email-batch-${publicationId}`} className="sr-only">
          Liste des adresses e-mail
        </label>
        <textarea
          id={`email-batch-${publicationId}`}
          value={recipientsText}
          onChange={(e) => setRecipientsText(e.target.value)}
          rows={4}
          placeholder="exemple@mail.fr, autre@mail.fr"
          className="w-full resize-y rounded-md border border-ink/[0.12] bg-white px-3 py-2 text-sm text-ink dark:border-ink/[0.2] dark:bg-paper"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg border border-terracotta/40 bg-terracotta/10 px-4 py-2 text-xs font-bold text-ink transition hover:bg-terracotta/20 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Envoi…" : "Envoyer"}
        </button>
      </form>
      {error ? <p className="mt-2 text-xs text-red-700 dark:text-red-400">{error}</p> : null}
      {message ? (
        <p className="mt-2 whitespace-pre-wrap text-xs text-ink/75">{message}</p>
      ) : null}
    </div>
  );
}

"use client";

import { useState } from "react";

export function TextCorrectorTool() {
  const [value, setValue] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function corriger() {
    setError(null);
    setResult(null);
    setPending(true);
    try {
      const response = await fetch("/api/correcteur/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: value }),
      });
      const data = (await response.json()) as { corrected_text?: string; error?: string };
      if (!response.ok) {
        throw new Error(data.error || `Erreur ${response.status}`);
      }
      if (data.corrected_text !== undefined) {
        setResult(data.corrected_text);
      } else if (data.error) {
        setError(data.error);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Problème de connexion.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-6">
      <label className="block text-sm font-medium text-ink/80" htmlFor="correcteur-input">
        Votre texte
      </label>
      <textarea
        id="correcteur-input"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        rows={12}
        className="w-full resize-y rounded-xl border border-ink/[0.12] bg-paper px-4 py-3 font-mono text-sm leading-relaxed text-ink shadow-inner shadow-ink/[0.02] placeholder:text-ink/35 focus:border-accent/55 focus:outline-none focus:ring-2 focus:ring-accent/15"
        placeholder="Écris ou colle ton texte ici…"
        spellCheck={false}
      />
      <button
        type="button"
        onClick={() => void corriger()}
        disabled={pending || !value.trim()}
        className="rounded-xl bg-ink px-5 py-2.5 text-sm font-bold text-paper transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {pending ? "Correction en cours…" : "Corriger"}
      </button>
      {error ? (
        <p className="rounded-lg border border-red-300/80 bg-red-50 px-4 py-3 text-sm text-red-900 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
          {error}
        </p>
      ) : null}
      {result !== null ? (
        <div className="rounded-xl border border-ink/[0.1] bg-paper-muted/40 p-4 dark:border-ink/[0.12]">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-terracotta">Texte corrigé</p>
          <div className="mt-3 whitespace-pre-wrap font-mono text-sm leading-relaxed text-ink">{result}</div>
        </div>
      ) : null}
      <p className="text-xs leading-relaxed text-ink/45">
        Correction orthographique et grammaticale via{" "}
        <a href="https://languagetool.org" className="font-bold underline underline-offset-2" target="_blank" rel="noreferrer">
          LanguageTool
        </a>{" "}
        (public). Usage modéré recommandé.
      </p>
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";

function countWords(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/u).length;
}

export function WordCounterTool() {
  const [value, setValue] = useState("");

  const stats = useMemo(() => {
    const chars = value.length;
    const charsNoSpace = value.replace(/\s/g, "").length;
    const words = countWords(value);
    const paras = value.trim() ? value.split(/\n\s*\n/).filter(Boolean).length : 0;
    return { chars, charsNoSpace, words, paras };
  }, [value]);

  return (
    <div className="space-y-6">
      <label className="block text-sm font-medium text-ink/80" htmlFor="wc-input">
        Votre texte
      </label>
      <textarea
        id="wc-input"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        rows={12}
        className="w-full resize-y rounded-xl border border-ink/[0.12] bg-paper px-4 py-3 font-mono text-sm leading-relaxed text-ink shadow-inner shadow-ink/[0.02] placeholder:text-ink/35 focus:border-accent/55 focus:outline-none focus:ring-2 focus:ring-accent/15"
        placeholder="Collez ou rédigez ici…"
        spellCheck={false}
      />
      <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat label="Mots" value={stats.words} />
        <Stat label="Caractères" value={stats.chars} />
        <Stat label="Sans espaces" value={stats.charsNoSpace} />
        <Stat label="Paragraphes" value={stats.paras} />
      </dl>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-ink/[0.08] bg-paper-muted/90 px-4 py-3">
      <dt className="text-xs font-semibold uppercase tracking-wider text-ink/45">{label}</dt>
      <dd className="mt-1 font-mono text-2xl tabular-nums text-ink">{value}</dd>
    </div>
  );
}

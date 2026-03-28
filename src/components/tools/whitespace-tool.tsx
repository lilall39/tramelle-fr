"use client";

import { useMemo, useState } from "react";

function cleanText(input: string): string {
  return input
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/^\s+|\s+$/gm, "")
    .trim();
}

export function WhitespaceTool() {
  const [raw, setRaw] = useState("");

  const cleaned = useMemo(() => cleanText(raw), [raw]);

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <label className="block text-sm font-medium text-ink/80" htmlFor="ws-raw">
          Texte à nettoyer
        </label>
        <textarea
          id="ws-raw"
          value={raw}
          onChange={(e) => setRaw(e.target.value)}
          rows={10}
          className="w-full resize-y rounded-xl border border-ink/15 bg-paper px-4 py-3 font-mono text-sm leading-relaxed text-ink shadow-inner shadow-ink/[0.03] placeholder:text-ink/35 focus:border-accent/50 focus:outline-none focus:ring-2 focus:ring-accent/25"
          placeholder="Collage depuis PDF, mail, tableur…"
          spellCheck={false}
        />
      </div>
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <label className="text-sm font-medium text-ink/80" htmlFor="ws-out">
            Résultat
          </label>
          <button
            type="button"
            onClick={() => {
              void navigator.clipboard.writeText(cleaned);
            }}
            disabled={!cleaned}
            className="rounded-full border border-ink/15 bg-paper px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-ink/80 transition-colors hover:border-accent/40 hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
          >
            Copier
          </button>
        </div>
        <textarea
          id="ws-out"
          readOnly
          value={cleaned}
          rows={10}
          className="w-full resize-y rounded-xl border border-dashed border-ink/20 bg-paper-muted/50 px-4 py-3 font-mono text-sm leading-relaxed text-ink/90"
        />
      </div>
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";

type ResultLine = { label: string; text: string };

function parseNum(s: string): number | null {
  const t = s.trim().replace(",", ".");
  if (t === "" || t === "-" || t === "+") return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
}

export function PercentageTool() {
  const [a, setA] = useState("");
  const [b, setB] = useState("");

  const result = useMemo(() => {
    const na = parseNum(a);
    const nb = parseNum(b);
    if (na === null || nb === null) return null;
    if (nb === 0) return { kind: "error" as const, message: "B ne peut pas être zéro pour cette proportion." };
    const partOf = (na / nb) * 100;
    if (na === 0) {
      return {
        kind: "ok" as const,
        lines: [
          {
            label: "Proportion (part de A dans B)",
            text: "A représente 0 % de B.",
          },
          {
            label: "Variation en passant de A à B",
            text: "non calculable : quand A vaut 0, la variation en % par rapport à A n’a pas de sens.",
          },
        ],
      };
    }
    const delta = ((nb - na) / na) * 100;
    const lines: ResultLine[] = [
      {
        label: "Proportion (part de A dans B)",
        text: `A représente ${formatFr(partOf)} % de B.`,
      },
      {
        label: "Variation en passant de A à B",
        text: `Écart de ${formatFr(delta)} % par rapport à A (hausse si B est plus grand que A, baisse sinon).`,
      },
    ];
    return { kind: "ok" as const, lines };
  }, [a, b]);

  return (
    <div className="space-y-8">
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-ink/80" htmlFor="pct-a">
            A (référence ou « partie »)
          </label>
          <input
            id="pct-a"
            inputMode="decimal"
            value={a}
            onChange={(e) => setA(e.target.value)}
            className="w-full rounded-xl border border-ink/[0.12] bg-paper px-4 py-3 font-mono text-sm text-ink focus:border-accent/55 focus:outline-none focus:ring-2 focus:ring-accent/15"
            placeholder="ex. 120"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-ink/80" htmlFor="pct-b">
            B (total ou « tout »)
          </label>
          <input
            id="pct-b"
            inputMode="decimal"
            value={b}
            onChange={(e) => setB(e.target.value)}
            className="w-full rounded-xl border border-ink/[0.12] bg-paper px-4 py-3 font-mono text-sm text-ink focus:border-accent/55 focus:outline-none focus:ring-2 focus:ring-accent/15"
            placeholder="ex. 400"
          />
        </div>
      </div>
      <div className="rounded-2xl border border-ink/[0.08] bg-paper-muted/80 px-5 py-5">
        {!result ? (
          <p className="text-sm text-ink/55">
            Saisissez A et B : l’encadré affichera le bloc Proportion (part de A dans B), puis le bloc Variation en
            passant de A à B — les mêmes titres que sur les résultats.
          </p>
        ) : result.kind === "error" ? (
          <p className="text-sm font-bold text-terracotta">{result.message}</p>
        ) : (
          <ul className="space-y-4 text-sm leading-relaxed text-ink/85">
            {result.lines.map((row, i) => (
              <li key={`${row.label}-${i}`} className="space-y-1">
                <p className="text-xs font-bold uppercase tracking-wider text-terracotta/90">{row.label}</p>
                <p className="text-ink/90">{row.text}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
      <p className="text-sm font-bold leading-relaxed text-terracotta">
        Rappel : « Proportion » = A par rapport à B ; « Variation… » = écart en % quand on va de A à B. À adapter
        selon votre cas (stocks, taux, etc.).
      </p>
    </div>
  );
}

function formatFr(n: number): string {
  return new Intl.NumberFormat("fr-FR", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  }).format(n);
}

"use client";

import { useMemo, useState } from "react";

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
        lines: [`A représente 0 % de B.`],
      };
    }
    const delta = ((nb - na) / na) * 100;
    const lines = [
      `A représente ${formatFr(partOf)} % de B.`,
      `Passer de A à B : variation de ${formatFr(delta)} % par rapport à A.`,
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
          <p className="text-sm text-ink/55">Saisissez deux nombres pour voir le résultat.</p>
        ) : result.kind === "error" ? (
          <p className="text-sm text-terracotta">{result.message}</p>
        ) : (
          <ul className="space-y-2 text-sm leading-relaxed text-ink/85">
            {result.lines.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        )}
      </div>
      <p className="text-xs leading-relaxed text-ink/50">
        Interprétation : « A est quelle part de B ? » et « si A est l’ancienne valeur et B la nouvelle, de combien
        cela varie-t-il en pourcentage ? » — pensez à vérifier le sens métier si vous comparez des stocks ou des
        taux.
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

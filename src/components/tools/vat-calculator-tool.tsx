"use client";

import { useMemo, useState } from "react";

const PRESET_RATES = [
  { label: "20 % — taux normal", value: 20 },
  { label: "10 % — taux intermédiaire", value: 10 },
  { label: "5,5 % — taux réduit", value: 5.5 },
  { label: "2,1 % — taux super réduit", value: 2.1 },
] as const;

type BaseKind = "ht" | "ttc";

function parseAmount(s: string): number | null {
  const t = s.trim().replace(/\s/g, "").replace(",", ".");
  if (t === "" || t === "-" || t === "+") return null;
  const n = Number(t);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

function parseRate(s: string): number | null {
  const t = s.trim().replace(",", ".");
  if (t === "") return null;
  const n = Number(t);
  if (!Number.isFinite(n) || n < 0 || n > 100) return null;
  return n;
}

function formatMoney(n: number): string {
  return new Intl.NumberFormat("fr-FR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}

export function VatCalculatorTool() {
  const [base, setBase] = useState<BaseKind>("ht");
  const [amountStr, setAmountStr] = useState("");
  const [presetKey, setPresetKey] = useState<string>("20");
  const [customRate, setCustomRate] = useState("");
  const useCustom = presetKey === "custom";

  const ratePercent = useMemo(() => {
    if (useCustom) return parseRate(customRate);
    const found = PRESET_RATES.find((p) => String(p.value) === presetKey);
    return found ? found.value : parseRate(presetKey);
  }, [presetKey, customRate, useCustom]);

  const result = useMemo(() => {
    const amount = parseAmount(amountStr);
    if (amount === null || ratePercent === null) return null;
    const r = ratePercent / 100;
    if (base === "ht") {
      const tva = amount * r;
      const ttc = amount + tva;
      return { ht: amount, tva, ttc };
    }
    const ht = amount / (1 + r);
    const tva = amount - ht;
    return { ht, tva, ttc: amount };
  }, [amountStr, ratePercent, base]);

  return (
    <div className="space-y-8">
      <fieldset className="space-y-3">
        <legend className="text-sm font-medium text-ink/80">Vous partez de</legend>
        <div className="flex flex-wrap gap-4">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-ink/85">
            <input
              type="radio"
              name="vat-base"
              checked={base === "ht"}
              onChange={() => setBase("ht")}
              className="border-ink/30 text-accent focus:ring-accent/30"
            />
            Montant HT (hors taxes)
          </label>
          <label className="flex cursor-pointer items-center gap-2 text-sm text-ink/85">
            <input
              type="radio"
              name="vat-base"
              checked={base === "ttc"}
              onChange={() => setBase("ttc")}
              className="border-ink/30 text-accent focus:ring-accent/30"
            />
            Montant TTC (toutes taxes comprises)
          </label>
        </div>
      </fieldset>

      <div className="space-y-2">
        <label className="text-sm font-medium text-ink/80" htmlFor="vat-amount">
          {base === "ht" ? "Montant HT (€)" : "Montant TTC (€)"}
        </label>
        <input
          id="vat-amount"
          inputMode="decimal"
          value={amountStr}
          onChange={(e) => setAmountStr(e.target.value)}
          className="w-full max-w-md rounded-xl border border-ink/[0.12] bg-paper px-4 py-3 font-mono text-sm text-ink focus:border-accent/55 focus:outline-none focus:ring-2 focus:ring-accent/15"
          placeholder="ex. 100 ou 99,99"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-ink/80" htmlFor="vat-rate-select">
          Taux de TVA
        </label>
        <select
          id="vat-rate-select"
          value={presetKey}
          onChange={(e) => setPresetKey(e.target.value)}
          className="w-full max-w-md rounded-xl border border-ink/[0.12] bg-paper px-4 py-3 text-sm text-ink focus:border-accent/55 focus:outline-none focus:ring-2 focus:ring-accent/15"
        >
          {PRESET_RATES.map((p) => (
            <option key={p.value} value={String(p.value)}>
              {p.label}
            </option>
          ))}
          <option value="custom">Autre taux (personnalisé)</option>
        </select>
        {useCustom ? (
          <div className="flex flex-wrap items-center gap-2 pt-2">
            <label className="sr-only" htmlFor="vat-custom-rate">
              Taux personnalisé en pourcentage
            </label>
            <input
              id="vat-custom-rate"
              inputMode="decimal"
              value={customRate}
              onChange={(e) => setCustomRate(e.target.value)}
              className="w-full max-w-xs rounded-xl border border-ink/[0.12] bg-paper px-4 py-3 font-mono text-sm text-ink focus:border-accent/55 focus:outline-none focus:ring-2 focus:ring-accent/15"
              placeholder="ex. 8,5"
            />
            <span className="text-sm text-ink/50">%</span>
          </div>
        ) : null}
      </div>

      <div className="rounded-2xl border border-ink/[0.08] bg-paper-muted/80 px-5 py-5">
        {!result || ratePercent === null ? (
          <p className="text-sm text-ink/55">Saisissez un montant et un taux valides.</p>
        ) : (
          <dl className="grid gap-4 sm:grid-cols-3">
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wider text-ink/45">Montant HT</dt>
              <dd className="mt-1 font-mono text-lg tabular-nums text-ink">{formatMoney(result.ht)} €</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wider text-ink/45">TVA ({formatRateLabel(ratePercent)})</dt>
              <dd className="mt-1 font-mono text-lg tabular-nums text-ink">{formatMoney(result.tva)} €</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wider text-ink/45">Montant TTC</dt>
              <dd className="mt-1 font-mono text-lg tabular-nums text-ink">{formatMoney(result.ttc)} €</dd>
            </div>
          </dl>
        )}
      </div>

      <p className="text-xs leading-relaxed text-ink/50">
        Outil d’aide à la lecture : les taux correspondent aux principaux taux français courants ; vérifiez toujours le taux
        applicable à votre situation et la réglementation en vigueur.
      </p>
    </div>
  );
}

function formatRateLabel(p: number): string {
  return new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 2, minimumFractionDigits: 0 }).format(p) + " %";
}

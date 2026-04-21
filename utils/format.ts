const eur = new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 2,
});

export function formatEur(value: number): string {
  return eur.format(value);
}

export function formatShortDate(iso: string): string {
  try {
    const raw = iso.slice(0, 10);
    const d = /^\d{4}-\d{2}-\d{2}$/.test(raw)
      ? new Date(`${raw}T12:00:00`)
      : new Date(iso);
    return d.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
    });
  } catch {
    return '';
  }
}

/** Date du jour pour sous-titre d’en-tête (ex. « lundi 20 avril 2026 »). */
export function formatTodayFrLong(): string {
  try {
    const raw = new Date().toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    return raw.replace(/^\p{L}/u, (c) => c.toUpperCase());
  } catch {
    return '';
  }
}

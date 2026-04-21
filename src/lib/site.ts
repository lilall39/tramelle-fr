export const siteName = "Tramelle";
export const siteDomain = "tramelle.fr";

/**
 * URL canonique (méta, sitemap, JSON-LD).
 * - Production : définir NEXT_PUBLIC_SITE_URL=https://tramelle.fr sur Vercel.
 * - Previews Vercel : sans variable, VERCEL_URL est utilisée automatiquement.
 */
export function getSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit?.startsWith("http")) return explicit.replace(/\/$/, "");
  const vercel = process.env.VERCEL_URL;
  if (vercel) return `https://${vercel.replace(/\/$/, "")}`;
  return `https://${siteDomain}`;
}

/** Voix éditoriale — court, mémorable, réutilisable (méta, footer, hero). */
export const brand = {
  kicker: "Tramelle",
  /** Accroche terracotta sur l’accueil uniquement (footer / JSON-LD gardent `subtitle`). */
  heroKickerLine: "Tramelle — Applications, Services, Ventes, Articles, Annonces, etc.",
  subtitle: "Outils minuscules, textes posés",
  heroTitle: "L’utile sans le bruit",
  heroLead:
    "Consultez librement les annonces et les contenus, profitez d’outils utiles au quotidien, et publiez simplement vos propres annonces ou écrits : ici, pas de tunnel d’inscription compliqué, une inscription par e-mail suffit si vous voulez publier — pas de promesse miracle, juste des services accessibles, concrets et efficaces.",
  sommaireLabel: "Explorer",
} as const;

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
  heroTitle: "L’utile sans le bruit.",
  heroLead:
    "Ici, pas de tunnel d’inscription ni de tableau de bord : de petites applications pour le quotidien, des articles qu’on peut rouvrir le lendemain, des services, etc., sans promesse miracle.",
  sommaireLabel: "Explorer",
} as const;

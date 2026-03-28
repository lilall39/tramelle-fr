export const siteName = "Tramelle";
export const siteDomain = "tramelle.fr";

/** URL canonique ; surcharger avec NEXT_PUBLIC_SITE_URL en prod (Vercel). */
export function getSiteUrl(): string {
  const env = process.env.NEXT_PUBLIC_SITE_URL;
  if (env?.startsWith("http")) return env.replace(/\/$/, "");
  return `https://${siteDomain}`;
}

/** Voix éditoriale — court, mémorable, réutilisable (méta, footer, hero). */
export const brand = {
  kicker: "Tramelle",
  subtitle: "Outils minuscules, textes posés",
  heroTitle: "L’utile sans le bruit.",
  heroLead:
    "Ici, pas de tunnel d’inscription ni de tableau de bord : des petits outils pour le quotidien, des articles qu’on peut rouvrir le lendemain, et des billets qui gardent une voix — le tout en français, sans promesse miracle.",
  sommaireLabel: "Dans ce numéro",
} as const;

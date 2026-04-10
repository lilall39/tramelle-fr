import type { OutilMeta } from "./types";

export type OutilCategoryId = "redaction" | "calculs" | "seo" | "ia" | "utilitaires";

export type OutilCategory = {
  id: OutilCategoryId;
  label: string;
  description: string;
};

export const outilCategories: OutilCategory[] = [
  {
    id: "redaction",
    label: "Redaction",
    description: "Outils pour ecrire, reformuler et verifier un texte avant publication.",
  },
  {
    id: "calculs",
    label: "Calculs",
    description: "Petits calculateurs pour les besoins rapides du quotidien.",
  },
  {
    id: "seo",
    label: "SEO",
    description: "Outils pour travailler la visibilite et la structure des contenus.",
  },
  {
    id: "ia",
    label: "IA",
    description: "Ressources pour preparer et ameliorer des demandes a l'IA.",
  },
  {
    id: "utilitaires",
    label: "Utilitaires",
    description: "Fonctions pratiques qui ne rentrent pas dans les autres categories.",
  },
];

export type OutilMetaWithCategory = OutilMeta & { category: OutilCategoryId };

export const outils: OutilMetaWithCategory[] = [
  {
    kind: "outil",
    slug: "compteur-de-mots",
    title: "Compteur de mots",
    tagline: "Compter mots et caractères, sans quitter la page.",
    description:
      "Collez un texte ou tapez sur place : le compteur se met à jour en direct. Pratique pour les mails, les éditos, les longs messages qui méritent d’être un peu plus courts.",
    publishedAt: "2026-03-01",
    tags: ["texte", "rédaction"],
    category: "redaction",
  },
  {
    kind: "outil",
    slug: "pourcentage-rapide",
    title: "Pourcentage rapide",
    tagline: "Vous entrez deux nombres : l’outil affiche tout de suite la proportion et l’écart en %.",
    description:
      "Vous saisissez A et B, puis vous regardez l’encadré sous les champs. Le bloc intitulé « Proportion (part de A dans B) » indique quelle part représente A par rapport à B — par exemple 25 et 100 donnent 25 %. Le bloc « Variation en passant de A à B » indique de combien de pourcents on monte ou on baisse quand on passe de la valeur A à la valeur B — par exemple 80 puis 100 donnent +25 %. Pas besoin de tableur.",
    publishedAt: "2026-02-01",
    tags: ["calcul", "quotidien"],
    category: "calculs",
  },
  {
    kind: "outil",
    slug: "catalogue-prompts-ia",
    title: "Catalogue de prompts IA",
    tagline:
      "Ressource externe de Vincent Flibustier : un catalogue de prompts structurés par profession (plus de deux mille idées réparties dans des dizaines de métiers). Utile pour formuler une consigne claire ou gagner du temps avant d’affiner vous-même le texte.",
    description:
      "Vincent Flibustier, formateur en citoyenneté numérique (IA, fake news, réseaux sociaux, OSINT). Catalogue de prompts par métier sur vincentflibustier.com.",
    publishedAt: "2026-04-04",
    tags: ["IA", "rédaction", "texte"],
    externalUrl: "https://vincentflibustier.com/prompting.html",
    category: "ia",
  },
];

export function getOutilBySlug(slug: string): OutilMetaWithCategory | undefined {
  return outils.find((o) => o.slug === slug);
}

export function getAllOutilSlugs(): string[] {
  return outils.map((o) => o.slug);
}

export function getCategoryById(id: string): OutilCategory | undefined {
  return outilCategories.find((c) => c.id === id);
}

export function getAllCategoryIds(): string[] {
  return outilCategories.map((c) => c.id);
}

export function getToolsByCategory(categoryId: OutilCategoryId): OutilMetaWithCategory[] {
  return outils
    .filter((o) => o.category === categoryId)
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
}

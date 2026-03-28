import type { OutilMeta } from "./types";

export const outils: OutilMeta[] = [
  {
    kind: "outil",
    slug: "sur-consigne",
    title: "Sur consigne",
    tagline:
      "Tu lui donnes une consigne, il s’adapte. Corriger, rédiger, poésie, dissertation, traduire, répondre à une question, expliquer un sujet ou développer une idée — selon ce que vous lui demandez.",
    description:
      "Écris ta demande, deux-points, puis tes mots (poésie :, traduis :, dissertation…). Relecture, traduction, réponses : l’outil suit ta consigne. Hébergé séparément ; premier chargement parfois lent.",
    publishedAt: "2026-03-28",
    tags: ["texte", "rédaction"],
    embedUrl: "https://mon-correcteur.onrender.com/",
  },
  {
    kind: "outil",
    slug: "compteur-de-mots",
    title: "Compteur de mots",
    tagline: "Compter mots et caractères, sans quitter la page.",
    description:
      "Collez un texte ou tapez sur place : le compteur se met à jour en direct. Pratique pour les mails, les éditos, les longs messages qui méritent d’être un peu plus courts.",
    publishedAt: "2026-03-01",
    tags: ["texte", "rédaction"],
  },
  {
    kind: "outil",
    slug: "nettoyer-espaces",
    title: "Nettoyer les espaces",
    tagline: "Supprimer espaces surnuméraires et sauts de ligne fantômes.",
    description:
      "Souvent, on colle un paragraphe depuis un PDF ou un mail et il arrive avec des trous bizarres. Cet outil normalise les espaces et les retours à la ligne — sans « réécrire » votre texte.",
    publishedAt: "2026-02-15",
    tags: ["texte", "collage"],
  },
  {
    kind: "outil",
    slug: "pourcentage-rapide",
    title: "Pourcentage rapide",
    tagline: "Calculer une variation ou une proportion en deux champs.",
    description:
      "Quel pourcentage représente A par rapport à B ? De combien B a-t-il augmenté par rapport à A ? Des questions banaires qui n’ont pas besoin d’un tableur.",
    publishedAt: "2026-02-01",
    tags: ["calcul", "quotidien"],
  },
];

export function getOutilBySlug(slug: string): OutilMeta | undefined {
  return outils.find((o) => o.slug === slug);
}

export function getAllOutilSlugs(): string[] {
  return outils.map((o) => o.slug);
}

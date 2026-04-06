import type { OutilMeta } from "./types";

export const outils: OutilMeta[] = [
  {
    kind: "outil",
    slug: "sur-consigne",
    title: "Sur consigne",
    tagline:
      "Vous lui donnez une consigne, il s’adapte. Corriger, rédiger, poésie, dissertation, traduire, expliquer un sujet ou développer une idée — selon ce que vous lui demandez.",
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
    tagline: "Vous entrez deux nombres : l’outil affiche tout de suite la proportion et l’écart en %.",
    description:
      "Vous saisissez A et B, puis vous regardez l’encadré sous les champs. Le bloc intitulé « Proportion (part de A dans B) » indique quelle part représente A par rapport à B — par exemple 25 et 100 donnent 25 %. Le bloc « Variation en passant de A à B » indique de combien de pourcents on monte ou on baisse quand on passe de la valeur A à la valeur B — par exemple 80 puis 100 donnent +25 %. Pas besoin de tableur.",
    publishedAt: "2026-02-01",
    tags: ["calcul", "quotidien"],
  },
  {
    kind: "outil",
    slug: "calcul-tva",
    title: "Calcul TVA",
    tagline: "Passer du HT au TTC (ou l’inverse) aux taux français courants.",
    description:
      "Choisissez un taux (20 %, 10 %, 5,5 %, 2,1 % ou un pourcentage personnalisé), indiquez un montant HT ou TTC : l’outil affiche la TVA et les deux montants complémentaires.",
    publishedAt: "2026-03-28",
    tags: ["calcul", "pro"],
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
  },
];

export function getOutilBySlug(slug: string): OutilMeta | undefined {
  return outils.find((o) => o.slug === slug);
}

export function getAllOutilSlugs(): string[] {
  return outils.map((o) => o.slug);
}

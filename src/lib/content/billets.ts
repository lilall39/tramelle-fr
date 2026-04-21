import type { BilletFrontMatter } from "./types";

export const billets: BilletFrontMatter[] = [
  {
    kind: "billet",
    slug: "ce-que-j-ai-appris-en-ecrivant-en-public",
    title: "Ce que j’ai appris en écrivant « en public »",
    mood: "note de terrain",
    publishedAt: "2026-03-02",
    blocks: [
      {
        type: "p",
        text:
          "Écrire sur un site à soi, ce n’est pas la même chose qu’un fil social. Il n’y a pas le même rythme, pas la même gratification instantanée. Au début, ça fait un peu vide — puis ce vide devient utile : on arrête de performer et on recommence à articuler.",
      },
      {
        type: "p",
        text:
          "Le plus dur n’est pas la phrase parfaite. C’est d’accepter qu’une idée puisse être publiée alors qu’elle est encore en mouvement. Les billets, ici, servent à ça : des textes plus courts, plus personnels, qui peuvent se contredire avec un article plus travaillé. Les deux se répondent.",
      },
    ],
  },
  {
    kind: "billet",
    slug: "range-ses-fichiers-comme-on-range-son-atelier",
    title: "Ranger ses fichiers comme on range son atelier",
    mood: "atelier",
    publishedAt: "2026-02-20",
    blocks: [
      {
        type: "p",
        text:
          "Un atelier n’est jamais « fini ». Il est prêt. Prêt veut dire : je retrouve l’outil sans chercher dix minutes, je vois ce qui est en cours, je ne confonds pas brouillon et version envoyée.",
      },
      {
        type: "p",
        text:
          "J’ai longtemps cru qu’il fallait une taxonomie brillante. En pratique, trois dossiers stables et une règle simple — « si je ne le retrouve pas en 30 secondes, le nom est mauvais » — ont fait plus que toutes les arborescences théoriques.",
      },
    ],
  },
  {
    kind: "billet",
    slug: "petit-manifeste-pour-les-sites-qui-respirent",
    title: "Petit manifeste pour les sites qui respirent",
    mood: "opinion",
    publishedAt: "2026-01-18",
    blocks: [
      {
        type: "p",
        text:
          "Un site peut être utile sans hurler. Il peut proposer des outils sans vous traiter comme un « utilisateur » à optimiser. Il peut être beau sans être une démo de composants.",
      },
      {
        type: "p",
        text:
          "Tramelle est un pari : mélanger l’utile immédiat et le texte qui prend le temps. Si parfois ça fait magazine de cuisine plutôt que tableau SaaS, tant mieux : la cuisine, au moins, finit par nourrir.",
      },
    ],
  },
];

export function getBilletBySlug(slug: string): BilletFrontMatter | undefined {
  return billets.find((b) => b.slug === slug);
}

export function getAllBilletSlugs(): string[] {
  return billets.map((b) => b.slug);
}

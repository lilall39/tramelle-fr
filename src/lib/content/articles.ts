import type { ArticleFrontMatter } from "./types";

export const articles: ArticleFrontMatter[] = [
  {
    kind: "article",
    slug: "lire-le-web-sans-se-laisser-happer",
    title: "Lire le web sans se laisser happer",
    deck:
      "Quand la page devient une ruelle bruyante, il reste des gestes simples pour garder le fil — et un peu de dignité.",
    lede:
      "Les outils ne remplacent pas l’attention : ils l’épaulent. Voici une grille légère pour naviguer sans confondre urgence et importance.",
    publishedAt: "2026-02-12",
    readingMinutes: 8,
    tags: ["attention", "lecture", "habitudes"],
    blocks: [
      {
        type: "p",
        text:
          "On appelle parfois « outil » ce qui accélère. Ici, on entend autre chose : un petit dispositif qui clarifie, qui recadre, qui rend une tâche honnête. Pas de promesse magique : seulement moins de friction entre l’idée et le geste.",
      },
      {
        type: "h2",
        text: "Le piège du flux infini",
      },
      {
        type: "p",
        text:
          "Le flux est un excellent vendeur d’instantanéité. Il propose la nouveauté comme preuve de valeur. Or la plupart des choses qui comptent — comprendre, décider, écrire — demandent une temporalité différente : celle où l’on peut se tromper tranquillement, puis se corriger.",
      },
      {
        type: "blockquote",
        text:
          "Un bon outil ne vous pousse pas à enchaîner : il vous aide à terminer.",
      },
      {
        type: "h2",
        text: "Trois règles sobres (qui vieillissent bien)",
      },
      {
        type: "ul",
        items: [
          "Isoler la tâche : une fenêtre, un objectif, une durée courte.",
          "Écrire avant de consommer : une phrase, une intention, une question.",
          "Fermer ce qui n’est pas nécessaire : l’onglet qui commente à votre place n’est pas un collaborateur.",
        ],
      },
      {
        type: "h2",
        text: "Ce que Tramelle essaie de faire",
      },
      {
        type: "p",
        text:
          "Ce site mélange des mini-outils (pour le concret), des articles (pour la méthode et le recul) et des billets (pour l’expérience vécue). Ce n’est pas un tableau de bord : c’est un atelier ouvert. Les textes peuvent vieillir ; l’espoir, c’est qu’ils restent utiles même quand les interfaces autour auront changé.",
      },
    ],
  },
  {
    kind: "article",
    slug: "petits-rituels-numeriques-dans-une-journee",
    title: "Petits rituels numériques qui tiennent dans une journée",
    deck:
      "Pas une « routine miracle » : des points d’appui réalistes pour quelqu’un qui travaille déjà assez.",
    lede:
      "Les grands programmes de productivité échouent souvent pour une raison triviale : ils demandent plus d’énergie que la journée n’en offre. Voici une version plus humble.",
    publishedAt: "2026-01-08",
    readingMinutes: 6,
    tags: ["habitudes", "travail", "bien-être"],
    blocks: [
      {
        type: "p",
        text:
          "Un rituel n’a pas besoin d’être photogénique. Il doit être faisable quand on est fatigué, pressé, ou distrait. S’il tient dans cinq minutes, il a plus de chances de survivre à février qu’un manifeste de treize pages.",
      },
      {
        type: "h2",
        text: "Le matin : poser une intention lisible",
      },
      {
        type: "p",
        text:
          "Une phrase suffit. Pas un plan stratégique : « Aujourd’hui je termine le mail X » ou « Je rédige l’esquisse avant 11 h ». L’important est que ce soit vérifiable. La journée vous tiraille déjà ; pas besoin d’y ajouter une liste de quinze items.",
      },
      {
        type: "h2",
        text: "Le milieu de journée : un reset sans culpabilité",
      },
      {
        type: "p",
        text:
          "Quand l’attention se fragmente, un micro-arrêt aide plus qu’un nouveau café. Se lever, ouvrir une fenêtre, relire la phrase du matin : ce sont des gestes ridicules qui recollent les morceaux. La culpabilité, elle, ne recolle rien.",
      },
      {
        type: "h2",
        text: "Le soir : ranger sans « optimiser sa vie »",
      },
      {
        type: "ul",
        items: [
          "Fermer les onglets « à lire » qui ne le seront jamais (ou les noter ailleurs, une fois).",
          "Laisser le bureau numérique prêt pour demain : fichier ouvert, dossier visible.",
          "Accepter qu’une journée peut finir sur un demi-chapitre : c’est encore une page de plus.",
        ],
      },
      {
        type: "p",
        text:
          "Sur Tramelle, les outils sont pensés pour ces moments bancals : quand il faut compter vite, nettoyer du texte collé, vérifier un pourcentage. Ce n’est pas glorieux. C’est exactement le genre de besoin qui revient, semaine après semaine.",
      },
    ],
  },
];

export function getArticleBySlug(slug: string): ArticleFrontMatter | undefined {
  return articles.find((a) => a.slug === slug);
}

export function getAllArticleSlugs(): string[] {
  return articles.map((a) => a.slug);
}

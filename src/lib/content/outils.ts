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
    slug: "generateur-lettres-gratuites-instantane",
    title: "Générateur de lettres gratuites instantané",
    tagline:
      "Lettres prêtes à envoyer, mini-guide pratique à côté, export PDF — résiliation, préavis, réclamation, remboursement et plus.",
    description:
      "Créez gratuitement vos lettres en ligne : résiliation abonnement, préavis logement, réclamation colis, remboursement, attestation, mise en demeure, banque, assurance. Générateur de lettres gratuit avec PDF, aperçu direct et sans inscription sur Tramelle.fr.",
    publishedAt: "2026-04-19",
    tags: ["lettre", "courrier", "PDF", "administratif"],
    category: "utilitaires",
    embedUrl: "/outils/generateur-lettres-gratuites-instantane.html",
  },
  {
    kind: "outil",
    slug: "generateur-devis-facture-instantane",
    title: "Générateur de devis & facture instantané gratuit sans inscription",
    tagline:
      "Créez en ligne devis, factures et factures d’acompte — TVA, remises, brouillon dans le navigateur, PDF immédiat.",
    description:
      "Créez en ligne vos devis sans inscription, factures et factures d’acompte : ajoutez client, prestations, quantité, prix, remise et TVA. Calculs automatiques en direct, brouillon enregistré dans le navigateur et téléchargement PDF immédiat.",
    publishedAt: "2026-04-18",
    tags: ["devis", "facture", "TVA", "PDF", "acompte"],
    category: "utilitaires",
    embedUrl: "/outils/generateur-devis-facture-instantane.html",
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
    category: "redaction",
  },
  {
    kind: "outil",
    slug: "scribbr-correcteur-orthographe",
    title: "Scribbr — correcteur d’orthographe",
    tagline: "Vérifier orthographe, grammaire et ponctuation sur un texte court, sans inscription.",
    description:
      "Correcteur en ligne proposé par Scribbr : suggestions pour fautes, accords, ponctuation et choix de mots. Service tiers — le lien ouvre leur site en français.",
    publishedAt: "2026-04-10",
    tags: ["orthographe", "grammaire", "rédaction"],
    externalUrl: "https://www.scribbr.fr/correcteur-orthographe/",
    category: "redaction",
  },
  {
    kind: "outil",
    slug: "pilotage-projet-editorial-livres",
    title: "Pilotage projet éditorial",
    tagline: "Structurer et suivre un projet de livre : jalons, phases et vue d’ensemble éditoriale.",
    description:
      "Application en ligne pour piloter un ouvrage : organisation du travail, repères dans le temps et lecture d’ensemble du projet. Service tiers hébergé sur Vercel — le lien ouvre l’outil dans un nouvel onglet.",
    publishedAt: "2026-04-13",
    tags: ["édition", "livre", "projet"],
    externalUrl: "https://projet-editorial-livres.vercel.app/",
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
  {
    kind: "outil",
    slug: "vintedgenius",
    title: "VintedGenius",
    tagline:
      "Rédiger des annonces Vinted plus visibles : titre, description, hashtags et pistes pour les photos, avec l’IA.",
    description:
      "Service en ligne pour préparer des annonces orientées vente sur Vinted : textes détaillés, mots-clés et idées de présentation. Offre et conditions sur le site de l’éditeur — le lien ouvre VintedGenius dans un nouvel onglet.",
    publishedAt: "2026-04-13",
    tags: ["Vinted", "IA", "vente"],
    externalUrl: "https://www.vintedgenius.com/",
    category: "ia",
  },
  {
    kind: "outil",
    slug: "lil-boost-seo-backlinks",
    title: "LilBoost SEO — Backlinks",
    tagline: "Indiquer l’adresse d’un site pour lancer une analyse des backlinks.",
    description:
      "Outil LilBoost SEO : saisie de l’URL du site, puis analyse des liens entrants. Service tiers hébergé sur Vercel — le lien ouvre la page dédiée dans un nouvel onglet.",
    publishedAt: "2026-04-13",
    tags: ["SEO", "backlinks", "référencement"],
    externalUrl: "https://lil-boost-seo.vercel.app/backlinks.html",
    category: "seo",
  },
  {
    kind: "outil",
    slug: "spotify",
    title: "Spotify",
    tagline: "Écouter de la musique et des podcasts dans le navigateur ou via l’application.",
    description:
      "Spotify propose le streaming musical, des playlists, des podcasts et des recommandations. Le lien ouvre le service sur le Web ; vous pouvez aussi utiliser l’app sur téléphone ou ordinateur.",
    publishedAt: "2026-04-10",
    tags: ["musique", "audio", "streaming"],
    externalUrl: "https://open.spotify.com/",
    category: "utilitaires",
  },
  {
    kind: "outil",
    slug: "geovelo",
    title: "Geovelo",
    tagline: "L’application vélo gratuite qui sécurise vos itinéraires.",
    description:
      "Geovelo propose des itinéraires à vélo en privilégiant pistes et zones plus sûres, avec des réglages selon le type de vélo. Application gratuite pour calculer un trajet, découvrir des balades et suivre votre pratique.",
    publishedAt: "2026-04-10",
    tags: ["vélo", "mobilité", "itinéraires"],
    externalUrl: "https://geovelo.app/fr/",
    category: "utilitaires",
  },
  {
    kind: "outil",
    slug: "tva-fr",
    title: "TVA.fr",
    tagline: "Calculatrice de TVA : passer du hors taxes au TTC et inversement, avec les taux français courants.",
    description:
      "TVA.fr permet de calculer la TVA sur un montant : saisie HT ou TTC, choix du taux (20 %, 10 %, 8,5 %, 5,5 %, 2,1 %), montant de taxe affiché. Outil indépendant, utile pour les devis, factures ou vérifications rapides.",
    publishedAt: "2026-04-10",
    tags: ["TVA", "calcul", "HT", "TTC"],
    externalUrl: "https://www.tva.fr/",
    category: "calculs",
  },
  {
    kind: "outil",
    slug: "trouver-mon-stage",
    title: "Trouver mon stage",
    tagline:
      "Recherche de stages à l’international, pistes par pays, et aide pour CV + lettre de motivation — gratuit et sans inscription.",
    description:
      "Plateforme guidée : liens vers des sites de recherche de stage selon le pays, génération d’une lettre de motivation à partir de mots-clés (modifiable avant enregistrement), repères pour le CV et export d’un dossier prêt à envoyer. Service tiers sur Vercel ; selon l’outil, les données peuvent rester sur votre appareil.",
    publishedAt: "2026-04-13",
    tags: ["stage", "CV", "international"],
    externalUrl: "https://stagess.vercel.app/",
    category: "utilitaires",
  },
  {
    kind: "outil",
    slug: "quiz-vulcain",
    title: "Quiz Vulcain",
    tagline:
      "Quiz et résumés par chapitre pour Les oubliés de Vulcain (Danielle Martinigol) — aide aux devoirs.",
    description:
      "Résumés des chapitres, fiches personnages dans l’onglet prévu, et quiz pour s’entraîner sur l’œuvre. Pensé comme une aide aux devoirs autour du roman. Site indépendant sur Vercel — le lien ouvre l’application dans un nouvel onglet.",
    publishedAt: "2026-04-13",
    tags: ["devoirs", "livre", "quiz"],
    externalUrl: "https://quiz-vulcain.vercel.app/",
    category: "redaction",
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

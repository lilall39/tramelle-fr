export type ContentKind = "article" | "billet" | "outil";

export type ContentBlock =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "h3"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "blockquote"; text: string };

export type ArticleFrontMatter = {
  kind: "article";
  slug: string;
  title: string;
  deck: string;
  lede: string;
  publishedAt: string; // ISO date
  updatedAt?: string;
  readingMinutes: number;
  tags: string[];
  blocks: ContentBlock[];
};

export type BilletFrontMatter = {
  kind: "billet";
  slug: string;
  title: string;
  mood?: string;
  publishedAt: string;
  blocks: ContentBlock[];
};

export type OutilMeta = {
  kind: "outil";
  slug: string;
  title: string;
  tagline: string;
  description: string;
  publishedAt: string;
  tags: string[];
  /** Si défini, l’outil est affiché dans une iframe (hébergement externe). */
  embedUrl?: string;
  /** Lien vers une ressource externe (pas d’iframe) : page Tramelle avec appel à l’action. */
  externalUrl?: string;
};

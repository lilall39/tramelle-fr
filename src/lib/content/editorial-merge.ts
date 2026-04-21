import type { ArticleFrontMatter, BilletFrontMatter, ContentBlock } from "@/lib/content/types";

/** Contenu éditable stocké dans Firestore (collection editorialPages → override). */
export type ArticleEditorialOverride = {
  title?: string;
  deck?: string;
  lede?: string;
  readingMinutes?: number;
  tags?: string[];
  /** Remplace le corps : paragraphes séparés par une ou plusieurs lignes vides. */
  plainBody?: string;
};

export type BilletEditorialOverride = {
  title?: string;
  mood?: string;
  plainBody?: string;
};

export function plainToBlocks(plain: string): ContentBlock[] {
  const normalized = plain.replace(/\r\n/g, "\n").trim();
  if (!normalized) return [];
  return normalized
    .split(/\n\n+/)
    .map((t) => t.trim())
    .filter(Boolean)
    .map((text) => ({ type: "p" as const, text }));
}

/** Aperçu éditable : fusionne blocs en texte (titres et listes indiqués simplement). */
export function blocksToPlainForEdit(blocks: ContentBlock[]): string {
  return blocks
    .map((b) => {
      if (b.type === "p") return b.text;
      if (b.type === "h2") return `[Titre] ${b.text}`;
      if (b.type === "h3") return `[Sous-titre] ${b.text}`;
      if (b.type === "blockquote") return `> ${b.text}`;
      if (b.type === "ul") return b.items.map((line) => `• ${line}`).join("\n");
      return "";
    })
    .filter(Boolean)
    .join("\n\n");
}

export function mergeArticleWithOverride(
  base: ArticleFrontMatter,
  override: ArticleEditorialOverride | null | undefined,
): ArticleFrontMatter {
  if (!override) return base;
  let blocks = base.blocks;
  if (override.plainBody != null && override.plainBody.trim() !== "") {
    blocks = plainToBlocks(override.plainBody);
  }
  return {
    ...base,
    title: override.title?.trim() || base.title,
    deck: override.deck?.trim() || base.deck,
    lede: override.lede?.trim() || base.lede,
    readingMinutes:
      typeof override.readingMinutes === "number" && Number.isFinite(override.readingMinutes)
        ? Math.max(1, Math.round(override.readingMinutes))
        : base.readingMinutes,
    tags: Array.isArray(override.tags) && override.tags.length > 0 ? override.tags : base.tags,
    blocks,
  };
}

export function mergeBilletWithOverride(
  base: BilletFrontMatter,
  override: BilletEditorialOverride | null | undefined,
): BilletFrontMatter {
  if (!override) return base;
  let blocks = base.blocks;
  if (override.plainBody != null && override.plainBody.trim() !== "") {
    blocks = plainToBlocks(override.plainBody);
  }
  return {
    ...base,
    title: override.title?.trim() || base.title,
    mood: override.mood !== undefined ? override.mood.trim() || undefined : base.mood,
    blocks,
  };
}

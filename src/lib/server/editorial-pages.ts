import { getFirestore } from "firebase-admin/firestore";
import { getFirebaseAdminApp } from "@/lib/firebase/admin-server";
import type { ArticleFrontMatter, BilletFrontMatter } from "@/lib/content/types";
import {
  mergeArticleWithOverride,
  mergeBilletWithOverride,
  type ArticleEditorialOverride,
  type BilletEditorialOverride,
} from "@/lib/content/editorial-merge";
import { articles, getArticleBySlug } from "@/lib/content/articles";
import { billets, getBilletBySlug } from "@/lib/content/billets";
import type { EditorialKind } from "@/types/editorial-page";

/** Sans document Firestore : considéré comme en ligne (comportement historique). */
export type EditorialModerationState = "live" | "hidden" | "pending" | "removed";

function docId(kind: EditorialKind, slug: string): string {
  return `${kind}_${slug}`;
}

function normalizeModerationStatus(raw: string | undefined): EditorialModerationState {
  if (raw === "hidden") return "hidden";
  if (raw === "pending") return "pending";
  if (raw === "removed") return "removed";
  return "live";
}

/**
 * État de modération éditoriale (articles & billets).
 * Sans compte de service Admin : tout est traité comme « en ligne » (dev local sans clés).
 */
export async function getEditorialModerationStateServer(
  kind: EditorialKind,
  slug: string,
): Promise<EditorialModerationState> {
  const app = getFirebaseAdminApp();
  if (!app) return "live";
  const snap = await getFirestore(app).collection("editorialPages").doc(docId(kind, slug)).get();
  if (!snap.exists) return "live";
  const status = snap.data()?.status as string | undefined;
  return normalizeModerationStatus(status);
}

export async function isEditorialPubliclyVisibleServer(kind: EditorialKind, slug: string): Promise<boolean> {
  const s = await getEditorialModerationStateServer(kind, slug);
  return s === "live";
}

/** Slugs à exclure des index publics (masqués, en attente ou retirés). */
export async function getNonLiveEditorialSlugsServer(kind: EditorialKind): Promise<Set<string>> {
  const app = getFirebaseAdminApp();
  if (!app) return new Set();
  const snap = await getFirestore(app).collection("editorialPages").where("kind", "==", kind).get();
  const out = new Set<string>();
  for (const d of snap.docs) {
    const data = d.data() as { slug?: string; status?: string };
    const st = normalizeModerationStatus(data.status);
    if (st !== "live" && data.slug) out.add(data.slug);
  }
  return out;
}

/** Override seul (aperçu admin ou fusion). Sans admin SDK : null. */
export async function getArticleOverrideServer(slug: string): Promise<ArticleEditorialOverride | null> {
  const app = getFirebaseAdminApp();
  if (!app) return null;
  const snap = await getFirestore(app).collection("editorialPages").doc(docId("article", slug)).get();
  if (!snap.exists) return null;
  const o = snap.data()?.override as unknown;
  return o && typeof o === "object" ? (o as ArticleEditorialOverride) : null;
}

export async function getBilletOverrideServer(slug: string): Promise<BilletEditorialOverride | null> {
  const app = getFirebaseAdminApp();
  if (!app) return null;
  const snap = await getFirestore(app).collection("editorialPages").doc(docId("billet", slug)).get();
  if (!snap.exists) return null;
  const o = snap.data()?.override as unknown;
  return o && typeof o === "object" ? (o as BilletEditorialOverride) : null;
}

/** Page publique article : null si inconnu ou non visible. */
export async function getPublicArticleResolvedServer(slug: string): Promise<ArticleFrontMatter | null> {
  const base = getArticleBySlug(slug);
  if (!base) return null;
  const app = getFirebaseAdminApp();
  if (!app) return base;
  const snap = await getFirestore(app).collection("editorialPages").doc(docId("article", slug)).get();
  if (!snap.exists) return base;
  const data = snap.data() as { status?: string; override?: ArticleEditorialOverride };
  if (normalizeModerationStatus(data.status) !== "live") return null;
  return mergeArticleWithOverride(base, data.override ?? null);
}

/** Page publique billet : null si inconnu ou non visible. */
export async function getPublicBilletResolvedServer(slug: string): Promise<BilletFrontMatter | null> {
  const base = getBilletBySlug(slug);
  if (!base) return null;
  const app = getFirebaseAdminApp();
  if (!app) return base;
  const snap = await getFirestore(app).collection("editorialPages").doc(docId("billet", slug)).get();
  if (!snap.exists) return base;
  const data = snap.data() as { status?: string; override?: BilletEditorialOverride };
  if (normalizeModerationStatus(data.status) !== "live") return null;
  return mergeBilletWithOverride(base, data.override ?? null);
}

/** Liste publique résolue : applique les surcharges et retire les non visibles. */
export async function getPublicArticlesResolvedServer(): Promise<ArticleFrontMatter[]> {
  const app = getFirebaseAdminApp();
  if (!app) return [...articles];
  const snap = await getFirestore(app).collection("editorialPages").where("kind", "==", "article").get();
  const bySlug = new Map<string, { status?: string; override?: ArticleEditorialOverride }>();
  for (const d of snap.docs) {
    const data = d.data() as { slug?: string; status?: string; override?: ArticleEditorialOverride };
    if (data.slug) bySlug.set(data.slug, data);
  }
  return articles
    .map((base) => {
      const row = bySlug.get(base.slug);
      if (!row) return base;
      if (normalizeModerationStatus(row.status) !== "live") return null;
      return mergeArticleWithOverride(base, row.override ?? null);
    })
    .filter((v): v is ArticleFrontMatter => v !== null);
}

export async function getPublicBilletsResolvedServer(): Promise<BilletFrontMatter[]> {
  const app = getFirebaseAdminApp();
  if (!app) return [...billets];
  const snap = await getFirestore(app).collection("editorialPages").where("kind", "==", "billet").get();
  const bySlug = new Map<string, { status?: string; override?: BilletEditorialOverride }>();
  for (const d of snap.docs) {
    const data = d.data() as { slug?: string; status?: string; override?: BilletEditorialOverride };
    if (data.slug) bySlug.set(data.slug, data);
  }
  return billets
    .map((base) => {
      const row = bySlug.get(base.slug);
      if (!row) return base;
      if (normalizeModerationStatus(row.status) !== "live") return null;
      return mergeBilletWithOverride(base, row.override ?? null);
    })
    .filter((v): v is BilletFrontMatter => v !== null);
}

/** Aperçu admin : fusion base + surcharge même si masqué / retiré. */
export async function getAdminMergedArticleServer(slug: string): Promise<ArticleFrontMatter | null> {
  const base = getArticleBySlug(slug);
  if (!base) return null;
  const override = await getArticleOverrideServer(slug);
  return mergeArticleWithOverride(base, override);
}

export async function getAdminMergedBilletServer(slug: string): Promise<BilletFrontMatter | null> {
  const base = getBilletBySlug(slug);
  if (!base) return null;
  const override = await getBilletOverrideServer(slug);
  return mergeBilletWithOverride(base, override);
}

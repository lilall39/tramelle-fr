"use client";

import { deleteDoc, doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase/services";
import type { ArticleEditorialOverride, BilletEditorialOverride } from "@/lib/content/editorial-merge";
import type { EditorialKind } from "@/types/editorial-page";

export type EditorialModerationAction = "live" | "hidden" | "pending" | "removed";

/**
 * Met en ligne (supprime l’entrée s’il n’y a pas de texte surchargé), masque, met en attente ou retire du catalogue.
 * Préserve le champ `override` lors des changements de statut.
 */
export async function applyEditorialModeration(
  kind: EditorialKind,
  slug: string,
  action: EditorialModerationAction,
): Promise<void> {
  const db = getFirebaseDb();
  const id = `${kind}_${slug}`;
  const ref = doc(db, "editorialPages", id);

  if (action === "live") {
    const snap = await getDoc(ref);
    if (!snap.exists()) return;
    const data = snap.data();
    const override = data?.override;
    if (override != null && typeof override === "object") {
      await setDoc(ref, {
        kind,
        slug,
        status: "live",
        override,
        updatedAt: serverTimestamp(),
      });
      return;
    }
    await deleteDoc(ref);
    return;
  }

  const snap = await getDoc(ref);
  const existing = snap.exists() ? snap.data() : {};
  await setDoc(ref, {
    kind,
    slug,
    status: action,
    ...(existing.override != null ? { override: existing.override } : {}),
    updatedAt: serverTimestamp(),
  });
}

export async function saveArticleOverride(slug: string, override: ArticleEditorialOverride): Promise<void> {
  const db = getFirebaseDb();
  const ref = doc(db, "editorialPages", `article_${slug}`);
  const snap = await getDoc(ref);
  const prev = snap.exists() ? snap.data() : {};
  const statusRaw = prev.status as string | undefined;
  const status =
    statusRaw === "hidden" || statusRaw === "pending" || statusRaw === "removed" ? statusRaw : "live";

  await setDoc(
    ref,
    {
      kind: "article",
      slug,
      status,
      override,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}

export async function saveBilletOverride(slug: string, override: BilletEditorialOverride): Promise<void> {
  const db = getFirebaseDb();
  const ref = doc(db, "editorialPages", `billet_${slug}`);
  const snap = await getDoc(ref);
  const prev = snap.exists() ? snap.data() : {};
  const statusRaw = prev.status as string | undefined;
  const status =
    statusRaw === "hidden" || statusRaw === "pending" || statusRaw === "removed" ? statusRaw : "live";

  await setDoc(
    ref,
    {
      kind: "billet",
      slug,
      status,
      override,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}

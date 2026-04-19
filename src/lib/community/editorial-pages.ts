"use client";

import { deleteDoc, doc, serverTimestamp, setDoc } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase/services";
import type { EditorialKind } from "@/types/editorial-page";

export type EditorialModerationAction = "live" | "hidden" | "pending";

/**
 * Met en ligne (supprime l’entrée de modération), masque ou place en attente un article ou billet.
 * Réservé aux admins (règles Firestore).
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
    await deleteDoc(ref);
    return;
  }
  await setDoc(ref, {
    kind,
    slug,
    status: action,
    updatedAt: serverTimestamp(),
  });
}

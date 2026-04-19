import { getFirestore } from "firebase-admin/firestore";
import { getFirebaseAdminApp } from "@/lib/firebase/admin-server";
import type { EditorialKind } from "@/types/editorial-page";

/** Sans document Firestore : considéré comme en ligne (comportement historique). */
export type EditorialModerationState = "live" | "hidden" | "pending";

function docId(kind: EditorialKind, slug: string): string {
  return `${kind}_${slug}`;
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
  if (status === "hidden") return "hidden";
  if (status === "pending") return "pending";
  return "live";
}

export async function isEditorialPubliclyVisibleServer(kind: EditorialKind, slug: string): Promise<boolean> {
  const s = await getEditorialModerationStateServer(kind, slug);
  return s === "live";
}

/** Slugs à exclure des index publics (masqués ou en attente). */
export async function getNonLiveEditorialSlugsServer(kind: EditorialKind): Promise<Set<string>> {
  const app = getFirebaseAdminApp();
  if (!app) return new Set();
  const snap = await getFirestore(app).collection("editorialPages").where("kind", "==", kind).get();
  const out = new Set<string>();
  for (const d of snap.docs) {
    const data = d.data() as { slug?: string; status?: string };
    if (data.status === "hidden" || data.status === "pending") {
      if (data.slug) out.add(data.slug);
    }
  }
  return out;
}

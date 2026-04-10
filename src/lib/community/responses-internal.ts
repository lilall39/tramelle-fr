/**
 * Module interne — ne pas importer depuis les composants UI.
 * Points d’entrée autorisés :
 * - `@/lib/community/responses` (public)
 * - `@/lib/community/responses-admin` (modération)
 */

import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import type { Response, Submission } from "@/types/community";
import { canPostBePublished } from "@/lib/community/submission-moderation";
import {
  approveResponse,
  canResponseBeDisplayed,
  deleteResponse,
  normalizeResponseStatus,
  rejectResponse,
} from "@/lib/community/response-moderation";
import { getFirebaseDb } from "@/lib/firebase/services";

const COL = "responses";

/**
 * Pourquoi double filtre (Firestore + runtime) :
 * - la requête limite les données réseau ;
 * - canResponseBeDisplayed garantit l’invariant métier même si les données ou règles divergent.
 * NE PAS retirer l’un des deux.
 */
function docToResponse(id: string, raw: Record<string, unknown>): Response {
  const createdAt =
    typeof raw.createdAt === "number" && Number.isFinite(raw.createdAt)
      ? raw.createdAt
      : typeof raw.createdAt === "object" &&
          raw.createdAt !== null &&
          "toMillis" in raw.createdAt &&
          typeof (raw.createdAt as { toMillis: () => number }).toMillis === "function"
        ? (raw.createdAt as { toMillis: () => number }).toMillis()
        : Date.now();

  return {
    id,
    parentId: String(raw.parentId ?? ""),
    parentType: "submission",
    content: String(raw.content ?? ""),
    authorId: String(raw.authorId ?? ""),
    status: normalizeResponseStatus(raw.status),
    createdAt,
    parentResponseId:
      raw.parentResponseId === undefined || raw.parentResponseId === null
        ? undefined
        : String(raw.parentResponseId),
  };
}

/**
 * PROTÉGÉ : non exporté. Seule voie d’écriture de statut après transition métier.
 * Pourquoi : éviter tout contournement (mise à jour directe sans approve/reject/delete).
 */
async function persistResponseStatusUpdate(id: string, status: Response["status"]): Promise<void> {
  const db = getFirebaseDb();
  await updateDoc(doc(db, COL, id), {
    status,
    updatedAt: serverTimestamp(),
  });
}

export async function createResponse(parentId: string, content: string, authorId: string): Promise<string> {
  if (!authorId?.trim()) throw new Error("Connexion requise pour publier une réponse.");
  const trimmed = content.trim();
  if (!trimmed) throw new Error("Le message ne peut pas être vide.");

  const db = getFirebaseDb();
  const parentRef = doc(db, "submissions", parentId);
  const parentSnap = await getDoc(parentRef);
  if (!parentSnap.exists()) throw new Error("Publication introuvable.");

  const parent = { ...(parentSnap.data() as Submission), id: parentSnap.id };
  if (canPostBePublished(parent) !== true) {
    throw new Error("Les réponses ne sont pas autorisées sur cette publication.");
  }

  const ref = await addDoc(collection(db, COL), {
    parentId,
    parentType: "submission",
    content: trimmed,
    authorId,
    status: "pending",
    createdAt: Date.now(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

/**
 * PUBLIC RESPONSES MUST USE listResponsesForPublicDisplay ONLY.
 * Toute liste de réponses côté site public doit passer par cette fonction (double filtre obligatoire).
 */
export async function listResponsesForPublicDisplay(parentId: string): Promise<Response[]> {
  const db = getFirebaseDb();
  const q = query(
    collection(db, COL),
    where("parentId", "==", parentId),
    where("status", "==", "approved"),
    orderBy("createdAt", "asc"),
  );
  const snap = await getDocs(q);
  const rows = snap.docs.map((d) => docToResponse(d.id, d.data() as Record<string, unknown>));
  return rows.filter((r) => canResponseBeDisplayed(r));
}

export async function listPendingResponses(): Promise<(Response & { id: string })[]> {
  const db = getFirebaseDb();
  const q = query(collection(db, COL), where("status", "==", "pending"), orderBy("createdAt", "asc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ ...docToResponse(d.id, d.data() as Record<string, unknown>), id: d.id }));
}

/**
 * Réservé à `@/lib/community/responses-admin` — ne pas importer ailleurs.
 * Lecture brute pour modération uniquement.
 */
export async function fetchResponseByIdForModeration(id: string): Promise<(Response & { id: string }) | null> {
  const db = getFirebaseDb();
  const snap = await getDoc(doc(db, COL, id));
  if (!snap.exists()) return null;
  return { ...docToResponse(snap.id, snap.data() as Record<string, unknown>), id: snap.id };
}

export async function applyResponseModerationAction(
  id: string,
  response: Response,
  action: "approve" | "reject" | "delete",
): Promise<void> {
  const normalized: Response = { ...response, status: normalizeResponseStatus(response.status) };
  const result =
    action === "approve"
      ? approveResponse(normalized)
      : action === "reject"
        ? rejectResponse(normalized)
        : deleteResponse(normalized);
  if (!result.ok) throw new Error(result.reason);
  await persistResponseStatusUpdate(id, result.response.status);
}

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import type { Timestamp } from "firebase/firestore";
import type { PublicSubmission, Submission, SubmissionStatus } from "@/types/community";
import { getFirebaseDb } from "@/lib/firebase/services";
import {
  approvePost,
  canPostBePublished,
  deletePost,
  normalizeSubmissionStatus,
  rejectPost,
  type Post,
} from "@/lib/community/submission-moderation";

export { canPostBePublished, normalizeSubmissionStatus } from "@/lib/community/submission-moderation";

const COL = "submissions";

function createdAtMillis(ts: Timestamp | undefined): number {
  if (!ts || typeof ts.toMillis !== "function") return 0;
  return ts.toMillis();
}

function stripPrivate(data: Submission & { id: string }): PublicSubmission {
  const { privateName, privateEmail, privatePhone, ...rest } = data;
  void privateName;
  void privateEmail;
  void privatePhone;
  return { ...rest, status: normalizeSubmissionStatus(rest.status) };
}

function withNormalizedStatus<T extends Submission & { id: string }>(row: T): T {
  return { ...row, status: normalizeSubmissionStatus(row.status) };
}

/**
 * Applique une transition métier (core) puis persiste le statut Firestore.
 * À utiliser depuis l’admin (ou tout flux autorisé), pas depuis l’UI directe sans ce passage.
 */
export async function applyModerationAction(
  id: string,
  submission: Submission,
  action: "approve" | "reject" | "delete",
): Promise<void> {
  const post: Post = { ...submission, status: normalizeSubmissionStatus(submission.status) };
  const result =
    action === "approve" ? approvePost(post) : action === "reject" ? rejectPost(post) : deletePost(post);
  if (!result.ok) throw new Error(result.reason);
  await updateSubmissionStatus(id, result.post.status);
}

export async function createSubmission(data: Omit<Submission, "createdAt" | "updatedAt">): Promise<string> {
  const db = getFirebaseDb();
  const ref = await addDoc(collection(db, COL), {
    ...data,
    status: "pending",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

/**
 * Un seul `where` sur `status` (pas d’index composite requis). Tri et filtres par catégorie côté client.
 */
export async function listApprovedPublications(): Promise<PublicSubmission[]> {
  const db = getFirebaseDb();
  const q = query(collection(db, COL), where("status", "==", "approved"));
  const snap = await getDocs(q);
  const rows = snap.docs
    .map((d) => stripPrivate({ id: d.id, ...(d.data() as Submission) }))
    .filter((row) => canPostBePublished(row));
  rows.sort((a, b) => createdAtMillis(b.createdAt) - createdAtMillis(a.createdAt));
  return rows;
}

/** Détail public : uniquement si approuvé — jamais de champs privés. */
export async function getPublicPublicationById(id: string): Promise<PublicSubmission | null> {
  const db = getFirebaseDb();
  const snap = await getDoc(doc(db, COL, id));
  if (!snap.exists()) return null;
  const data = { id: snap.id, ...(snap.data() as Submission) };
  const normalized = { ...data, status: normalizeSubmissionStatus(data.status) };
  if (!canPostBePublished(normalized)) return null;
  return stripPrivate({ ...normalized, id: data.id });
}

/** Propriétaire ou admin : document complet. */
export async function getSubmissionByIdFull(id: string): Promise<(Submission & { id: string }) | null> {
  const db = getFirebaseDb();
  const snap = await getDoc(doc(db, COL, id));
  if (!snap.exists()) return null;
  return withNormalizedStatus({ id: snap.id, ...(snap.data() as Submission) });
}

export async function listMySubmissions(userId: string): Promise<(Submission & { id: string })[]> {
  const db = getFirebaseDb();
  const q = query(collection(db, COL), where("userId", "==", userId));
  const snap = await getDocs(q);
  const rows = snap.docs.map((d) => withNormalizedStatus({ id: d.id, ...(d.data() as Submission) }));
  rows.sort((a, b) => createdAtMillis(b.createdAt) - createdAtMillis(a.createdAt));
  return rows;
}

export async function listPendingSubmissions(): Promise<(Submission & { id: string })[]> {
  const db = getFirebaseDb();
  const q = query(collection(db, COL), where("status", "==", "pending"));
  const snap = await getDocs(q);
  const rows = snap.docs.map((d) => withNormalizedStatus({ id: d.id, ...(d.data() as Submission) }));
  rows.sort((a, b) => createdAtMillis(a.createdAt) - createdAtMillis(b.createdAt));
  return rows;
}

/** Liste admin : même fiche `/admin/moderation/[id]` que pour les brouillons (archiver, effacer). */
export async function listSubmissionsByStatusForModeration(
  status: SubmissionStatus,
): Promise<(Submission & { id: string })[]> {
  const db = getFirebaseDb();
  const q = query(collection(db, COL), where("status", "==", status));
  const snap = await getDocs(q);
  const rows = snap.docs.map((d) => withNormalizedStatus({ id: d.id, ...(d.data() as Submission) }));
  rows.sort((a, b) => createdAtMillis(b.createdAt) - createdAtMillis(a.createdAt));
  return rows;
}

export async function updateSubmissionStatus(id: string, status: SubmissionStatus): Promise<void> {
  const db = getFirebaseDb();
  await updateDoc(doc(db, COL, id), {
    status,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteSubmission(id: string): Promise<void> {
  const db = getFirebaseDb();
  await deleteDoc(doc(db, COL, id));
}

const RESPONSES_COL = "responses";
const BATCH_MAX = 500;

/**
 * Suppression définitive (modération) : la publication et toutes les réponses liées sont effacées.
 * Réservé aux comptes admin (règles Firestore).
 */
export async function permanentlyDeleteSubmissionForModeration(id: string): Promise<void> {
  const db = getFirebaseDb();
  const q = query(collection(db, RESPONSES_COL), where("parentId", "==", id));
  const snap = await getDocs(q);
  const submissionRef = doc(db, COL, id);
  const refs = [...snap.docs.map((d) => d.ref), submissionRef];
  for (let i = 0; i < refs.length; i += BATCH_MAX) {
    const batch = writeBatch(db);
    for (const ref of refs.slice(i, i + BATCH_MAX)) {
      batch.delete(ref);
    }
    await batch.commit();
  }
}

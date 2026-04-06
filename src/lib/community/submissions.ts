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
} from "firebase/firestore";
import type { Timestamp } from "firebase/firestore";
import type { PublicSubmission, Submission, SubmissionStatus } from "@/types/community";
import { getFirebaseDb } from "@/lib/firebase/services";

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
  return rest;
}

export async function createSubmission(data: Omit<Submission, "createdAt" | "updatedAt">): Promise<string> {
  const db = getFirebaseDb();
  const ref = await addDoc(collection(db, COL), {
    ...data,
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
  const rows = snap.docs.map((d) => stripPrivate({ id: d.id, ...(d.data() as Submission) }));
  rows.sort((a, b) => createdAtMillis(b.createdAt) - createdAtMillis(a.createdAt));
  return rows;
}

/** Détail public : uniquement si approuvé — jamais de champs privés. */
export async function getPublicPublicationById(id: string): Promise<PublicSubmission | null> {
  const db = getFirebaseDb();
  const snap = await getDoc(doc(db, COL, id));
  if (!snap.exists()) return null;
  const data = { id: snap.id, ...(snap.data() as Submission) };
  if (data.status !== "approved") return null;
  return stripPrivate(data);
}

/** Propriétaire ou admin : document complet. */
export async function getSubmissionByIdFull(id: string): Promise<(Submission & { id: string }) | null> {
  const db = getFirebaseDb();
  const snap = await getDoc(doc(db, COL, id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...(snap.data() as Submission) };
}

export async function listMySubmissions(userId: string): Promise<(Submission & { id: string })[]> {
  const db = getFirebaseDb();
  const q = query(collection(db, COL), where("userId", "==", userId));
  const snap = await getDocs(q);
  const rows = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Submission) }));
  rows.sort((a, b) => createdAtMillis(b.createdAt) - createdAtMillis(a.createdAt));
  return rows;
}

export async function listPendingSubmissions(): Promise<(Submission & { id: string })[]> {
  const db = getFirebaseDb();
  const q = query(collection(db, COL), where("status", "==", "pending"));
  const snap = await getDocs(q);
  const rows = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Submission) }));
  rows.sort((a, b) => createdAtMillis(a.createdAt) - createdAtMillis(b.createdAt));
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

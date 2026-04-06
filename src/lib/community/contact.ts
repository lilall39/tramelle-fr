import { addDoc, collection, getDocs, serverTimestamp } from "firebase/firestore";
import type { Timestamp } from "firebase/firestore";
import type { ContactMessage } from "@/types/community";
import { getFirebaseDb } from "@/lib/firebase/services";

const COL = "contactMessages";

export async function createContactMessage(
  data: Omit<ContactMessage, "createdAt" | "status">,
): Promise<void> {
  const db = getFirebaseDb();
  await addDoc(collection(db, COL), {
    ...data,
    status: "new",
    createdAt: serverTimestamp(),
  });
}

function createdAtMillis(ts: Timestamp | undefined): number {
  if (!ts || typeof ts.toMillis !== "function") return 0;
  return ts.toMillis();
}

export async function listContactMessages(): Promise<(ContactMessage & { id: string })[]> {
  const db = getFirebaseDb();
  const snap = await getDocs(collection(db, COL));
  const rows = snap.docs.map((d) => ({ id: d.id, ...(d.data() as ContactMessage) }));
  rows.sort((a, b) => createdAtMillis(b.createdAt) - createdAtMillis(a.createdAt));
  return rows;
}

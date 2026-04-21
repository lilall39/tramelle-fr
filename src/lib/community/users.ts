import type { User } from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import type { CommunityUser } from "@/types/community";
import { getFirebaseDb } from "@/lib/firebase/services";

const COL = "users";

/**
 * Si le compte Auth existe mais pas encore le document Firestore (ex. compte créé à la main dans la console),
 * le crée avec rôle `user`. Sinon ne fait rien.
 */
export async function ensureUserProfile(authUser: User): Promise<CommunityUser | null> {
  const existing = await getUserProfile(authUser.uid);
  if (existing) return existing;
  const email = authUser.email ?? "";
  const displayName =
    authUser.displayName?.trim() || (email.includes("@") ? email.split("@")[0]! : "Utilisateur");
  try {
    await createUserProfile(authUser.uid, email, displayName);
  } catch {
    return null;
  }
  return getUserProfile(authUser.uid);
}

export async function createUserProfile(uid: string, email: string, displayName: string): Promise<void> {
  const db = getFirebaseDb();
  await setDoc(doc(db, COL, uid), {
    uid,
    email,
    displayName,
    role: "user",
    status: "active",
    createdAt: serverTimestamp(),
  });
}

export async function getUserProfile(uid: string): Promise<CommunityUser | null> {
  const db = getFirebaseDb();
  const snap = await getDoc(doc(db, COL, uid));
  if (!snap.exists()) return null;
  return snap.data() as CommunityUser;
}

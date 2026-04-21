import { cert, getApps, initializeApp, type App, type ServiceAccount } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import type { ContactMessage, Submission, UserRole } from "@/types/community";
import { normalizeSubmissionStatus } from "@/lib/community/submission-moderation";

let cachedApp: App | null | undefined;

/**
 * Décode le compte de service depuis l’environnement.
 * - `FIREBASE_SERVICE_ACCOUNT_JSON_BASE64` (recommandé dans .env : pas de guillemets problématiques sur une très longue ligne)
 * - ou `FIREBASE_SERVICE_ACCOUNT_JSON` (JSON brut ou doublement sérialisé)
 */
function parseServiceAccountFromEnv(): ServiceAccount | null {
  const b64 = process.env.FIREBASE_SERVICE_ACCOUNT_JSON_BASE64?.trim();
  if (b64) {
    try {
      const decoded = Buffer.from(b64, "base64").toString("utf8");
      const obj = JSON.parse(decoded) as Record<string, unknown>;
      if (obj.type === "service_account" && typeof obj.private_key === "string") {
        return obj as ServiceAccount;
      }
    } catch {
      return null;
    }
  }

  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim();
  if (!raw || raw.length < 30) {
    return null;
  }
  try {
    const once = JSON.parse(raw) as unknown;
    if (typeof once === "object" && once !== null && (once as Record<string, unknown>).type === "service_account") {
      return once as ServiceAccount;
    }
    if (typeof once === "string") {
      const twice = JSON.parse(once) as Record<string, unknown>;
      if (twice.type === "service_account") return twice as ServiceAccount;
    }
  } catch {
    return null;
  }
  return null;
}

/**
 * Firebase Admin — lecture serveur sécurisée et vérification des jetons.
 */
export function getFirebaseAdminApp(): App | null {
  if (cachedApp !== undefined) return cachedApp;
  if (getApps().length > 0) {
    cachedApp = getApps()[0]!;
    return cachedApp;
  }
  const parsed = parseServiceAccountFromEnv();
  if (!parsed) {
    cachedApp = null;
    return null;
  }
  try {
    cachedApp = initializeApp({ credential: cert(parsed) });
    return cachedApp;
  } catch {
    cachedApp = null;
    return null;
  }
}

export async function verifyFirebaseIdToken(idToken: string): Promise<{ uid: string } | null> {
  const app = getFirebaseAdminApp();
  if (!app) return null;
  try {
    const decoded = await getAuth(app).verifyIdToken(idToken);
    return { uid: decoded.uid };
  } catch {
    return null;
  }
}

export async function getSubmissionByIdForServer(id: string): Promise<(Submission & { id: string }) | null> {
  const app = getFirebaseAdminApp();
  if (!app) return null;
  const snap = await getFirestore(app).collection("submissions").doc(id).get();
  if (!snap.exists) return null;
  const data = snap.data() as Submission;
  return {
    id: snap.id,
    ...data,
    status: normalizeSubmissionStatus(data.status),
  };
}

export async function getUserRoleForServer(uid: string): Promise<UserRole | null> {
  const app = getFirebaseAdminApp();
  if (!app) return null;
  const snap = await getFirestore(app).collection("users").doc(uid).get();
  if (!snap.exists) return null;
  const role = (snap.data() as { role?: string }).role;
  if (role === "admin" || role === "user") return role;
  return null;
}

export async function getContactMessageByIdForServer(
  id: string,
): Promise<(ContactMessage & { id: string }) | null> {
  const app = getFirebaseAdminApp();
  if (!app) return null;
  const snap = await getFirestore(app).collection("contactMessages").doc(id).get();
  if (!snap.exists) return null;
  return { id: snap.id, ...(snap.data() as ContactMessage) };
}

import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getFirebaseWebConfig } from "./config";

/**
 * Instance Firebase (client ou serveur Next : métadonnées, RSC).
 * Retourne null si la config Web est absente (variables NEXT_PUBLIC_FIREBASE_*).
 */
export function getFirebaseApp(): FirebaseApp | null {
  const config = getFirebaseWebConfig();
  if (!config?.apiKey || !config.projectId) return null;
  if (getApps().length > 0) return getApp();
  return initializeApp(config);
}

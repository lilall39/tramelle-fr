import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getFirebaseWebConfig } from "./config";

/** Instance app Firebase côté client uniquement. Retourne null si la config est absente ou hors navigateur. */
export function getFirebaseApp(): FirebaseApp | null {
  if (typeof window === "undefined") return null;
  const config = getFirebaseWebConfig();
  if (!config?.apiKey || !config.projectId) return null;
  if (getApps().length > 0) return getApp();
  return initializeApp(config);
}

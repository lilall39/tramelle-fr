import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";
import { getFirebaseApp } from "./app";

export function getFirebaseAuth(): Auth {
  const app = getFirebaseApp();
  if (!app) throw new Error("Firebase non initialisé (variables NEXT_PUBLIC_FIREBASE_* manquantes ?)");
  return getAuth(app);
}

export function getFirebaseDb(): Firestore {
  const app = getFirebaseApp();
  if (!app) throw new Error("Firebase non initialisé");
  return getFirestore(app);
}

export function getFirebaseStorage(): FirebaseStorage {
  const app = getFirebaseApp();
  if (!app) throw new Error("Firebase non initialisé");
  const bucket = String((app.options as { storageBucket?: string }).storageBucket || "").trim();
  if (!bucket) {
    throw new Error(
      "Stockage Firebase non configuré (variable NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET manquante)."
    );
  }
  // Rejeter uniquement les valeurs clairement invalides (ex. URL HTTP collée par erreur).
  if (/^https?:\/\//i.test(bucket)) {
    throw new Error(
      "Stockage Firebase mal configuré : NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET doit être l’identifiant du bucket (ex. « projet.appspot.com » ou « projet.firebasestorage.app »), pas une URL commençant par http(s)://."
    );
  }
  const bucketUrl = bucket.startsWith("gs://") ? bucket : `gs://${bucket}`;
  return getStorage(app, bucketUrl);
}

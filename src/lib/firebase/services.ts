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
  return getStorage(app);
}

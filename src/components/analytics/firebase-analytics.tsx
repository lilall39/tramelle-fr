"use client";

import { getFirebaseApp } from "@/lib/firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { useEffect } from "react";

/**
 * Initialise Google Analytics (Firebase) une fois au chargement.
 * Sans variables d’environnement, ne fait rien.
 */
export function FirebaseAnalytics() {
  useEffect(() => {
    const app = getFirebaseApp();
    if (!app) return;
    void isSupported().then((supported) => {
      if (supported) getAnalytics(app);
    });
  }, []);

  return null;
}

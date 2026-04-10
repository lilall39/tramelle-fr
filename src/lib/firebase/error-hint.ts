/** Message lisible pour erreurs Firebase côté client (sans exposer de détails techniques inutiles). */
export function firebaseErrorHint(err: unknown): string {
  if (err && typeof err === "object" && "code" in err) {
    const code = String((err as { code: string }).code);
    if (code === "permission-denied") {
      return "Permission refusée par Firestore. Ouvre la console Firebase → Firestore → Règles, vérifie que la suppression est autorisée (allow delete pour submissions), puis clique sur Publier.";
    }
    if (code === "unauthenticated") {
      return "Session expirée. Déconnecte-toi et reconnecte-toi, puis réessaie.";
    }
    if (code.startsWith("storage/")) {
      if (code === "storage/unauthorized") {
        return "Accès refusé au stockage des fichiers. Reconnecte-toi et réessaie.";
      }
      if (code === "storage/quota-exceeded") {
        return "Espace de stockage insuffisant. Réessaie plus tard ou contacte le site.";
      }
      if (code === "storage/canceled") {
        return "Envoi du fichier interrompu. Réessaie.";
      }
      return "Problème lors de l’envoi du fichier. Vérifie ta connexion et réessaie.";
    }
  }
  if (err instanceof Error && err.message) return err.message;
  return "Une erreur est survenue. Réessaie ou vérifie la console du navigateur (F12).";
}

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
  }
  if (err instanceof Error && err.message) return err.message;
  return "Une erreur est survenue. Réessaie ou vérifie la console du navigateur (F12).";
}

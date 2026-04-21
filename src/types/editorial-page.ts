export type EditorialKind = "article" | "billet";

/** Côté public, seul l’absence de document ou un doc `status: live` est visible. */
export type EditorialModerationStatus = "live" | "hidden" | "pending" | "removed";

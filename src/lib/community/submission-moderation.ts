import type { Submission, SubmissionStatus } from "@/types/community";

/** Alias métier : un « post » communautaire est un document `Submission`. */
export type Post = Submission;

export type ModerationResult =
  | { ok: true; post: Post }
  | { ok: false; reason: string };

/** Point unique : une publication n’est visible / partageable publiquement que si elle est approuvée. */
export function canPostBePublished(post: Pick<Post, "status">): boolean {
  return normalizeSubmissionStatus(post.status) === "approved";
}

/** Données legacy ou champs manquants : traiter comme « en attente ». */
export function normalizeSubmissionStatus(status: unknown): SubmissionStatus {
  if (status === "approved" || status === "rejected" || status === "pending" || status === "deleted") {
    return status;
  }
  return "pending";
}

function withStatus(post: Post, status: SubmissionStatus): Post {
  return { ...post, status };
}

/**
 * Transitions strictes (modération) :
 * - pending → approved | rejected | deleted
 * - approved → deleted uniquement (pas de retour arrière vers refus)
 * - rejected → deleted uniquement
 * - deleted → terminal
 */
export function approvePost(post: Post): ModerationResult {
  const s = normalizeSubmissionStatus(post.status);
  if (s === "deleted") return { ok: false, reason: "Publication supprimée : aucune action possible." };
  if (s !== "pending") return { ok: false, reason: "Seules les publications en attente peuvent être approuvées." };
  return { ok: true, post: withStatus(post, "approved") };
}

export function rejectPost(post: Post): ModerationResult {
  const s = normalizeSubmissionStatus(post.status);
  if (s === "deleted") return { ok: false, reason: "Publication supprimée : aucune action possible." };
  if (s !== "pending") return { ok: false, reason: "Seules les publications en attente peuvent être refusées." };
  return { ok: true, post: withStatus(post, "rejected") };
}

/** Suppression « métier » = archivage (statut deleted), pas de retour depuis deleted. */
export function deletePost(post: Post): ModerationResult {
  const s = normalizeSubmissionStatus(post.status);
  if (s === "deleted") return { ok: false, reason: "Publication déjà supprimée." };
  return { ok: true, post: withStatus(post, "deleted") };
}

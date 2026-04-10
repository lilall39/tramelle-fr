import type { Response } from "@/types/community";
import { normalizeSubmissionStatus } from "@/lib/community/submission-moderation";

export type ResponseModerationResult =
  | { ok: true; response: Response }
  | { ok: false; reason: string };

/** Même jeu de statuts que les soumissions ; données absentes → pending. */
export function normalizeResponseStatus(status: unknown): Response["status"] {
  return normalizeSubmissionStatus(status);
}

/** Aucune exception : une réponse n’est affichable publiquement que si elle est approuvée. */
export function canResponseBeDisplayed(response: Pick<Response, "status">): boolean {
  return normalizeResponseStatus(response.status) === "approved";
}

function withStatus(r: Response, status: Response["status"]): Response {
  return { ...r, status };
}

/**
 * Transitions alignées sur submission-moderation :
 * - pending → approved | rejected | deleted
 * - approved → deleted uniquement
 * - rejected → deleted uniquement
 * - deleted → terminal
 */
export function approveResponse(response: Response): ResponseModerationResult {
  const s = normalizeResponseStatus(response.status);
  if (s === "deleted") return { ok: false, reason: "Réponse supprimée : aucune action possible." };
  if (s !== "pending") return { ok: false, reason: "Seules les réponses en attente peuvent être approuvées." };
  return { ok: true, response: withStatus(response, "approved") };
}

export function rejectResponse(response: Response): ResponseModerationResult {
  const s = normalizeResponseStatus(response.status);
  if (s === "deleted") return { ok: false, reason: "Réponse supprimée : aucune action possible." };
  if (s !== "pending") return { ok: false, reason: "Seules les réponses en attente peuvent être refusées." };
  return { ok: true, response: withStatus(response, "rejected") };
}

export function deleteResponse(response: Response): ResponseModerationResult {
  const s = normalizeResponseStatus(response.status);
  if (s === "deleted") return { ok: false, reason: "Réponse déjà supprimée." };
  return { ok: true, response: withStatus(response, "deleted") };
}

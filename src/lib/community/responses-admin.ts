/**
 * API réservée à la modération (import depuis `app/admin/**` et composants admin dédiés uniquement).
 * Ne pas importer depuis les pages ou composants publics.
 */

import type { Response } from "@/types/community";
import {
  applyResponseModerationAction as applyResponseModerationActionImpl,
  fetchResponseByIdForModeration,
  listPendingResponses as listPendingResponsesImpl,
} from "@/lib/community/responses-internal";

/** Jeton à passer avec getResponseByIdForAdmin — ne pas exposer aux pages publiques. */
export const RESPONSES_ADMIN_GATE = Symbol("tramelle.responses.adminGate");

export const applyResponseModerationAction = applyResponseModerationActionImpl;

export const listPendingResponses = listPendingResponsesImpl;

/**
 * Lecture détail réponse pour modération uniquement.
 * Toute utilisation sans RESPONSES_ADMIN_GATE doit échouer.
 */
export async function getResponseByIdForAdmin(
  id: string,
  gate: typeof RESPONSES_ADMIN_GATE,
): Promise<(Response & { id: string }) | null> {
  if (gate !== RESPONSES_ADMIN_GATE) {
    throw new Error(
      "getResponseByIdForAdmin: accès réservé à la modération admin. Utiliser responses-admin.ts avec RESPONSES_ADMIN_GATE.",
    );
  }
  return fetchResponseByIdForModeration(id);
}

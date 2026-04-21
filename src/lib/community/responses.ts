/**
 * API publique — réponses communautaires.
 *
 * PUBLIC RESPONSES MUST USE listResponsesForPublicDisplay ONLY.
 * Ne pas interroger la collection `responses` directement depuis l’UI : pas de lecture brute.
 */

import {
  createResponse as createResponseImpl,
  listResponsesForPublicDisplay as listResponsesForPublicDisplayImpl,
} from "@/lib/community/responses-internal";

export const createResponse = createResponseImpl;

/** PUBLIC RESPONSES MUST USE listResponsesForPublicDisplay ONLY. */
export const listResponsesForPublicDisplay = listResponsesForPublicDisplayImpl;

export { canResponseBeDisplayed, normalizeResponseStatus } from "@/lib/community/response-moderation";

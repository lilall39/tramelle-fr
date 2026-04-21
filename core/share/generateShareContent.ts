export type ShareableSubmission = {
  id: string;
  title?: string;
  status: "pending" | "approved" | "rejected" | "deleted";
  slug?: string;
};

export interface ShareContent {
  text: string;
  url: string;
  hashtags: string[];
}

function getBaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_BASE_URL;
  if (raw !== undefined && raw !== null && String(raw).trim() !== "") {
    return String(raw).trim().replace(/\/+$/, "");
  }
  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin.replace(/\/+$/, "");
  }
  throw new Error(
    "NEXT_PUBLIC_BASE_URL est absent ou vide : impossible de construire l’URL de partage (ajoutez-la dans l’environnement ou appelez depuis une page ouverte dans le navigateur).",
  );
}

/**
 * Construit l’URL absolue de partage pour une publication.
 * TODO: compléter avec le segment d’URL public canonique (identifiant : submission.id ou submission.slug) dès que la route officielle sera figée côté produit — ne pas inventer de chemin ici.
 */
function buildSubmissionUrl(submission: ShareableSubmission): string {
  const baseUrl = getBaseUrl();
  void submission;
  return baseUrl;
}

/** Mots du titre strictement plus longs que 4 caractères (après nettoyage léger des bords), au plus 3. */
function hashtagWordsFromTitle(title: string): string[] {
  const out: string[] = [];
  const segments = title.trim().split(/\s+/).filter((s) => s.length > 0);
  for (const seg of segments) {
    if (out.length >= 3) break;
    const word = seg.replace(/^[^a-zA-ZÀ-ÿ0-9]+|[^a-zA-ZÀ-ÿ0-9]+$/g, "");
    if (word.length > 4) {
      out.push(word.toLowerCase());
    }
  }
  return out;
}

export function generateShareContent(submission: ShareableSubmission): ShareContent {
  if (submission.status !== "approved") {
    throw new Error("Le partage n’est autorisé que pour les publications au statut « approved ».");
  }

  const text = submission.title ?? "";
  const url = buildSubmissionUrl(submission);
  const hashtags = [...hashtagWordsFromTitle(text), "tendance", "partage"];

  return { text, url, hashtags };
}

import type { PublicSubmission } from "@/types/community";

/** Nombre maximum de photos pour une annonce (page /publier et fiche publique). */
export const MAX_ANNONCE_PHOTOS = 4;

/**
 * URLs des images affichées sur la fiche : article = couverture seule ;
 * annonce = liste `imageUrls` si présente, sinon `imageUrl` seul ;
 * autres catégories = une photo (`imageUrl`).
 */
export function getSubmissionGalleryUrls(
  s: Pick<PublicSubmission, "category" | "imageUrl" | "imageUrls" | "coverImage">,
): string[] {
  if (s.category === "article") {
    const u = s.coverImage ?? s.imageUrl;
    return u ? [u] : [];
  }
  if (s.category === "annonce") {
    const list = s.imageUrls;
    if (Array.isArray(list) && list.length > 0) {
      return list
        .filter((u): u is string => typeof u === "string" && u.trim().length > 0)
        .slice(0, MAX_ANNONCE_PHOTOS);
    }
    return s.imageUrl ? [s.imageUrl] : [];
  }
  return s.imageUrl ? [s.imageUrl] : [];
}

/** Première image : carte liste, métadonnées, partage. */
export function getSubmissionHeroImageUrl(
  s: Pick<PublicSubmission, "category" | "imageUrl" | "imageUrls" | "coverImage">,
): string | null {
  const urls = getSubmissionGalleryUrls(s);
  return urls[0] ?? null;
}

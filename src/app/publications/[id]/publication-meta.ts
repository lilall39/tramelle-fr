import type { PublicSubmission } from "@/types/community";
import { getSiteUrl } from "@/lib/site";

/**
 * TODO: garder aligné avec la route App Router (`app/publications/[id]/page.tsx`) si le segment d’URL change.
 * Ne pas inventer un autre schéma d’URL ici.
 */
function publicationPathSegment(id: string): string {
  return `/publications/${id}`;
}

/** Même logique que le layout (NEXT_PUBLIC_BASE_URL, puis getSiteUrl). Ne lance pas : requis pour le SSR des métas. */
export function getBaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_BASE_URL;
  if (raw !== undefined && raw !== null && String(raw).trim() !== "") {
    const t = String(raw).trim().replace(/\/+$/, "");
    if (t.startsWith("http")) return t;
  }
  return getSiteUrl().replace(/\/+$/, "");
}

export function buildPublicUrl(submission: Pick<PublicSubmission, "id">): string {
  return `${getBaseUrl()}${publicationPathSegment(submission.id)}`;
}

/** Même logique visuelle que `PublicationDetailClient` (image principale / couverture article). */
function heroImageUrl(submission: PublicSubmission): string | null {
  return submission.category === "article"
    ? submission.coverImage ?? submission.imageUrl
    : submission.imageUrl;
}

function absoluteImageUrl(submission: PublicSubmission, baseUrl: string): string {
  const hero = heroImageUrl(submission);
  if (!hero) {
    return `${baseUrl}/default-og.jpg`;
  }
  if (/^https?:\/\//i.test(hero)) {
    return hero;
  }
  return `${baseUrl}/${hero.replace(/^\//, "")}`;
}

function descriptionExcerpt(submission: PublicSubmission): string {
  const d = submission.description?.trim() ?? "";
  if (!d) return "";
  return d.length > 160 ? `${d.slice(0, 157)}…` : d;
}

export function buildPublicationMetadataContent(submission: PublicSubmission): {
  title: string;
  description: string;
  url: string;
  image: string;
} {
  const baseUrl = getBaseUrl();
  const title = submission.title?.trim() || "Publication";
  const description = descriptionExcerpt(submission) || "Découvre cette publication";
  const url = `${baseUrl}${publicationPathSegment(submission.id)}`;
  const image = absoluteImageUrl(submission, baseUrl);
  return { title, description, url, image };
}

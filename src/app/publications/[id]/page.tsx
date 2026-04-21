import { PublicationDetailClient } from "@/components/community/publication-detail-client";
import { getPublicPublicationById } from "@/lib/community/submissions";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { PublicSubmission } from "@/types/community";
import { buildPublicationMetadataContent, getBaseUrl } from "./publication-meta";

type Props = { params: Promise<{ id: string }> };

function fallbackMetadata(id: string): Metadata {
  const base = getBaseUrl();
  const url = `${base}/publications/${id}`;
  return {
    title: "Publication",
    description: "Découvre cette publication communautaire.",
    alternates: { canonical: `/publications/${id}` },
    openGraph: {
      title: "Publication",
      description: "Découvre cette publication communautaire.",
      url,
      images: [{ url: `${base}/default-og.jpg` }],
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: "Publication",
      description: "Découvre cette publication communautaire.",
      images: [`${base}/default-og.jpg`],
    },
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  let submission: PublicSubmission | null;
  try {
    submission = await getPublicPublicationById(id);
  } catch (e) {
    if (process.env.NODE_ENV === "development") {
      console.warn(
        "[publications/metadata] Lecture Firestore impossible, métadonnées génériques. Vérifiez NEXT_PUBLIC_FIREBASE_* dans .env.local.",
        e,
      );
    }
    return fallbackMetadata(id);
  }
  if (!submission) {
    notFound();
  }

  const { title, description, url, image } = buildPublicationMetadataContent(submission);

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      images: [{ url: image }],
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

export default async function PublicationDetailPage({ params }: Props) {
  const { id } = await params;
  return <PublicationDetailClient id={id} />;
}

import { PublicationDetailClient } from "@/components/community/publication-detail-client";
import type { Metadata } from "next";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return {
    title: "Publication",
    description: "Détail d’une publication communautaire.",
    alternates: { canonical: `/publications/${id}` },
  };
}

export default async function PublicationDetailPage({ params }: Props) {
  const { id } = await params;
  return <PublicationDetailClient id={id} />;
}

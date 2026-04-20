import { PageContainer } from "@/components/layout/page-container";
import { ContentCard } from "@/components/ui/content-card";
import { PageIntro } from "@/components/ui/page-intro";
import type { BilletFrontMatter } from "@/lib/content/types";
import { getPublicBilletsResolvedServer } from "@/lib/server/editorial-pages";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Billets",
  description:
    "Billets personnels : notes d’atelier, opinions et expériences — courts textes en français sur Tramelle.",
  alternates: { canonical: "/billets" },
};

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(iso));
}

function teaserFromBlocks(blocks: BilletFrontMatter["blocks"]): string {
  const first = blocks.find((b) => b.type === "p");
  if (!first || first.type !== "p") return "";
  const text = first.text;
  if (text.length <= 200) return text;
  return text.slice(0, 197).trimEnd() + "…";
}

export default async function BilletsIndexPage() {
  const resolved = await getPublicBilletsResolvedServer();
  const sorted = [...resolved].sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

  return (
    <PageContainer>
      <PageIntro
        eyebrow="Notes & voix"
        title="Billets"
        intro="Format court, ton plus direct. Ici, pas de vérité définitive : des notes d’atelier, des opinions, des morceaux d’expérience — parfois un peu bancals, assumés comme tels."
      />
      <ul className="grid gap-5 lg:grid-cols-2">
        {sorted.map((b) => (
          <li key={b.slug}>
            <ContentCard
              href={`/billets/${b.slug}`}
              title={b.title}
              meta={`${formatDate(b.publishedAt)}${b.mood ? ` · ${b.mood}` : ""}`}
              description={teaserFromBlocks(b.blocks)}
            />
          </li>
        ))}
      </ul>
    </PageContainer>
  );
}

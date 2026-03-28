import { PageContainer } from "@/components/layout/page-container";
import { ContentCard } from "@/components/ui/content-card";
import { PageIntro } from "@/components/ui/page-intro";
import { articles } from "@/lib/content/articles";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Articles",
  description:
    "Articles de fond sur l’attention, les habitudes numériques et le travail avec le web — rédigés en français.",
  alternates: { canonical: "/articles" },
};

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(iso));
}

export default function ArticlesIndexPage() {
  const sorted = [...articles].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );

  return (
    <PageContainer>
      <PageIntro
        eyebrow="Long format"
        title="Articles"
        intro="Des textes qu’on peut rouvrir le lendemain : cadres, recul, manière de voir le travail et le numérique — sans vous traiter comme un profil à optimiser."
      />
      <ul className="grid gap-5 lg:grid-cols-2">
        {sorted.map((a) => (
          <li key={a.slug}>
            <ContentCard
              href={`/articles/${a.slug}`}
              title={a.title}
              meta={`${formatDate(a.publishedAt)} · ${a.readingMinutes} min`}
              description={a.deck}
            />
          </li>
        ))}
      </ul>
    </PageContainer>
  );
}

import { PageContainer } from "@/components/layout/page-container";
import { ContentCard } from "@/components/ui/content-card";
import { PageIntro } from "@/components/ui/page-intro";
import { outils } from "@/lib/content/outils";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Outils",
  description:
    "Mini-outils en ligne : compteur de mots, nettoyage d’espaces, calcul de pourcentages — gratuits et sans inscription.",
  alternates: { canonical: "/outils" },
};

export default function OutilsIndexPage() {
  const sorted = [...outils].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );

  return (
    <PageContainer>
      <PageIntro
        eyebrow="Pratique"
        title="Outils"
        intro="Une collection qui grandit lentement. Chaque page fait une chose honnête — puis vous laisse reprendre votre travail, sans vous retenir dans un tableau de bord."
      />
      <ul className="grid gap-5 sm:grid-cols-2">
        {sorted.map((o) => (
          <li key={o.slug}>
            <ContentCard
              href={`/outils/${o.slug}`}
              title={o.title}
              meta="Outil"
              description={o.tagline}
              strongTeaser
            />
          </li>
        ))}
      </ul>
    </PageContainer>
  );
}

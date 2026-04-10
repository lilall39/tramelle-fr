import { PageContainer } from "@/components/layout/page-container";
import { ContentCard } from "@/components/ui/content-card";
import { PageIntro } from "@/components/ui/page-intro";
import { getToolsByCategory, outilCategories } from "@/lib/content/outils";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Outils",
  description:
    "Mini-outils en ligne : compteur de mots, calcul de pourcentages, liens utiles — gratuits et sans inscription.",
  alternates: { canonical: "/outils" },
};

export default function OutilsIndexPage() {
  const categories = outilCategories.map((category) => ({
    ...category,
    toolCount: getToolsByCategory(category.id).length,
  }));

  return (
    <PageContainer>
      <PageIntro
        eyebrow="Pratique"
        title="Outils"
        intro="Choisissez une categorie pour parcourir les outils. Chaque outil reste accessible avec son adresse directe."
      />
      <ul className="grid gap-5 sm:grid-cols-2">
        {categories.map((category) => (
          <li key={category.id}>
            <ContentCard
              href={`/outils/${category.id}`}
              title={category.label}
              description={`${category.description} (${category.toolCount} outil${category.toolCount > 1 ? "s" : ""})`}
              strongTeaser
            />
          </li>
        ))}
      </ul>
    </PageContainer>
  );
}

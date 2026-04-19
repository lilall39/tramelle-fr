import { PageContainer } from "@/components/layout/page-container";
import { OutilsCategoryPanels } from "@/components/tools/outils-category-panels";
import { PageIntro } from "@/components/ui/page-intro";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Outils",
  description:
    "Mini-outils en ligne : compteur de mots, calcul de pourcentages, liens utiles — gratuits et sans inscription.",
  alternates: { canonical: "/outils" },
};

export default function OutilsIndexPage() {
  return (
    <PageContainer>
      <PageIntro
        eyebrow="Pratique"
        title="Outils"
        intro="Utilitaires et outils gratuits sans inscription : créez en ligne vos devis, factures, lettres, documents PDF, générateurs pratiques et services instantanés. Rapide, simple et gratuit."
      />
      <p className="mb-8 rounded-xl border border-terracotta/25 bg-terracotta/[0.06] px-4 py-3 text-sm leading-relaxed text-ink/85">
        <span className="font-bold text-terracotta">Nouveau —</span>{" "}
        <Link
          href="/outils/generateur-devis-facture-instantane"
          className="font-bold text-ink underline decoration-terracotta/40 underline-offset-2 transition hover:text-terracotta"
        >
          Générateur de devis &amp; facture instantané
        </Link>{" "}
        (devis, factures, acomptes, PDF — sans inscription). Il figure aussi sous{" "}
        <strong className="font-semibold text-ink">Utilitaires</strong> une fois la section dépliée.
      </p>
      <OutilsCategoryPanels />
    </PageContainer>
  );
}

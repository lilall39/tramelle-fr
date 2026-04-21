import { AdminEditorialModeration } from "@/components/community/admin-editorial-moderation";
import { PageContainer } from "@/components/layout/page-container";
import { articles } from "@/lib/content/articles";
import { billets } from "@/lib/content/billets";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Articles & billets",
  robots: { index: false, follow: false },
};

export default function AdminEditorialPage() {
  const items = [
    ...articles.map((a) => ({ kind: "article" as const, slug: a.slug, title: a.title })),
    ...billets.map((b) => ({ kind: "billet" as const, slug: b.slug, title: b.title })),
  ].sort((a, b) => a.title.localeCompare(b.title, "fr"));

  return (
    <PageContainer>
      <h1 className="font-editorial-serif text-3xl font-bold text-ink">Articles & billets</h1>
      <p className="mt-2 max-w-2xl text-sm text-ink/60">
        Cliquez sur le titre ou « Modifier le texte » pour éditer titre et corps (enregistrés pour le site lorsque la page
        est en ligne). « Aperçu lecture » montre la page comme pour les admins ; « Voir comme le public » ouvre la version
        visible par tout le monde — vide si masqué ou retiré.
      </p>
      <p className="mt-3 max-w-2xl text-sm text-ink/60">
        Valider remet en ligne, masquer cache l’URL, en attente hors index, retirer du catalogue supprime l’adresse publique
        jusqu’à nouvelle mise en ligne.
      </p>
      <div className="mt-8">
        <AdminEditorialModeration items={items} />
      </div>
    </PageContainer>
  );
}

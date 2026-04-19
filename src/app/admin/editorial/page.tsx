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
        Cliquez sur le titre ou sur « Lire le texte » pour ouvrir la version complète (même si le texte est masqué pour
        les visiteurs). « Voir comme le public » ouvre la page telle que le site la montre — si le texte est masqué, cette
        adresse peut afficher une page vide. Pour changer le contenu rédigé, il faut encore le faire depuis les fichiers du
        site puis publier une mise à jour.
      </p>
      <p className="mt-3 max-w-2xl text-sm text-ink/60">
        Valider remet en ligne, masquer retire l’URL du site pour le public, en attente garde le texte hors index.
      </p>
      <div className="mt-8">
        <AdminEditorialModeration items={items} />
      </div>
    </PageContainer>
  );
}

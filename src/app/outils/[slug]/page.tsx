import { PageContainer } from "@/components/layout/page-container";
import { EmbeddedTool } from "@/components/tools/embedded-tool";
import { ExternalToolLinkout } from "@/components/tools/external-tool-linkout";
import { CataloguePromptsIntro } from "@/components/tools/catalogue-prompts-intro";
import { ToolShell } from "@/components/tools/tool-shell";
import { PercentageTool } from "@/components/tools/percentage-tool";
import { WordCounterTool } from "@/components/tools/word-counter-tool";
import { ContentCard } from "@/components/ui/content-card";
import {
  getAllCategoryIds,
  getAllOutilSlugs,
  getCategoryById,
  getOutilBySlug,
  getToolsByCategory,
} from "@/lib/content/outils";
import { getSiteUrl } from "@/lib/site";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return [...getAllOutilSlugs(), ...getAllCategoryIds()].map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = getCategoryById(slug);
  if (category) {
    return {
      title: `Outils ${category.label.toLowerCase()}`,
      description: category.description,
      alternates: { canonical: `/outils/${slug}` },
    };
  }
  const outil = getOutilBySlug(slug);
  if (!outil) return { title: "Outil introuvable" };
  const url = `${getSiteUrl()}/outils/${slug}`;
  const seoOverride =
    slug === "generateur-devis-facture-instantane"
      ? {
          title: "Générateur de devis & facture instantané gratuit | Tramelle",
          description:
            "Créez en ligne vos devis sans inscription, factures et factures d’acompte : client, prestations, quantité, prix, remise et TVA. Calculs automatiques, brouillon dans le navigateur, PDF immédiat.",
        }
      : slug === "generateur-lettres-gratuites-instantane"
        ? {
            title: "Générateur de lettres gratuites instantané | Tramelle",
            description:
              "Créez gratuitement vos lettres en ligne : résiliation abonnement, préavis logement, réclamation colis, remboursement, attestation, mise en demeure, banque, assurance. Générateur de lettres gratuit avec PDF, aperçu direct et sans inscription sur Tramelle.fr.",
          }
        : null;
  return {
    title: seoOverride?.title ?? outil.title,
    description: seoOverride?.description ?? outil.description,
    alternates: { canonical: `/outils/${slug}` },
    openGraph: {
      url,
      title: seoOverride ? seoOverride.title : `${outil.title} — Tramelle`,
      description: seoOverride?.description ?? outil.tagline,
    },
  };
}

function ToolBody({ slug }: { slug: string }) {
  const outil = getOutilBySlug(slug);
  if (!outil) return null;
  if (outil.embedUrl) {
    const sameOrigin = outil.embedUrl.startsWith("/");
    const tallEmbed =
      slug === "generateur-devis-facture-instantane" || slug === "generateur-lettres-gratuites-instantane";
    return (
      <EmbeddedTool src={outil.embedUrl} title={outil.title} sameOrigin={sameOrigin} tall={tallEmbed} />
    );
  }
  if (outil.externalUrl) {
    return <ExternalToolLinkout href={outil.externalUrl} title={outil.title} />;
  }
  switch (slug) {
    case "compteur-de-mots":
      return <WordCounterTool />;
    case "pourcentage-rapide":
      return <PercentageTool />;
    default:
      return null;
  }
}

export default async function OutilPage({ params }: Props) {
  const { slug } = await params;
  const category = getCategoryById(slug);
  if (category) {
    const tools = getToolsByCategory(category.id);
    return (
      <PageContainer>
        <nav className="mb-10 text-lg font-bold text-ink/60" aria-label="Fil d’Ariane">
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <Link href="/outils" className="underline-offset-4 hover:text-ink hover:underline">
                Outils
              </Link>
            </li>
            <li aria-hidden className="text-ink/35">
              /
            </li>
            <li className="text-ink/80">{category.label}</li>
          </ol>
        </nav>
        <header className="mb-8">
          <h1 className="font-editorial-serif text-4xl font-bold text-ink">Outils de {category.label.toLowerCase()}</h1>
          <p className="mt-3 max-w-2xl text-base text-ink/70">{category.description}</p>
        </header>
        {tools.length === 0 ? (
          <p className="text-sm text-ink/60">Aucun outil dans cette categorie pour le moment.</p>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2 sm:gap-4">
            {tools.map((tool) => (
              <li key={tool.slug}>
                <ContentCard
                  href={`/outils/${tool.slug}`}
                  title={tool.title}
                  description={tool.tagline}
                  strongTeaser
                  outilTitle
                />
              </li>
            ))}
          </ul>
        )}
      </PageContainer>
    );
  }

  const outil = getOutilBySlug(slug);
  if (!outil) notFound();

  const body = ToolBody({ slug });
  if (!body) notFound();

  const embeddedRemote = Boolean(outil.embedUrl && !outil.embedUrl.startsWith("/"));
  const isExternal = Boolean(outil.externalUrl);

  return (
    <PageContainer>
      <nav className="mb-10 text-lg font-bold text-ink/60" aria-label="Fil d’Ariane">
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <Link href="/outils" className="underline-offset-4 hover:text-ink hover:underline">
              Outils
            </Link>
          </li>
          <li aria-hidden className="text-ink/35">
            /
          </li>
          <li>
            <Link href={`/outils/${outil.category}`} className="underline-offset-4 hover:text-ink hover:underline">
              {getCategoryById(outil.category)?.label ?? "Categorie"}
            </Link>
          </li>
          <li aria-hidden className="text-ink/35">
            /
          </li>
          <li className="font-medium text-outil-title">{outil.title}</li>
        </ol>
      </nav>
      <p className="mb-6 text-sm font-bold text-terracotta">
        <Link href={`/outils/${outil.category}`} className="underline-offset-4 hover:underline">
          ← Retour a {getCategoryById(outil.category)?.label ?? "la categorie"}
        </Link>
      </p>
      <ToolShell
        title={outil.title}
        description={
          outil.slug === "catalogue-prompts-ia" ? (
            <CataloguePromptsIntro />
          ) : (
            outil.description
          )
        }
      >
        {body}
      </ToolShell>
      {embeddedRemote ? (
        <p className="mt-10 max-w-2xl text-sm leading-relaxed text-ink/55">
          Cet outil est affiché dans un cadre fourni par un service externe : disponibilité et temps de premier chargement
          dépendent de ce service.
        </p>
      ) : isExternal ? (
        <p className="mt-10 max-w-2xl text-sm leading-relaxed text-ink/55">
          Ce renvoi mène vers un site tiers : contenu, disponibilité et conditions d’usage dépendent de son auteur. Tramelle
          n’héberge pas ce catalogue et ne collecte rien lorsque vous suivez le lien.
        </p>
      ) : (
        <p className="mt-10 max-w-2xl text-sm leading-relaxed text-ink/55">
          Astuce : ces outils fonctionnent entièrement dans votre navigateur. Rien n’est envoyé sur un serveur — pratique
          pour un brouillon, un mail, une note rapide.
        </p>
      )}
    </PageContainer>
  );
}

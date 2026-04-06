import { PageContainer } from "@/components/layout/page-container";
import { EmbeddedTool } from "@/components/tools/embedded-tool";
import { ExternalToolLinkout } from "@/components/tools/external-tool-linkout";
import { CataloguePromptsIntro } from "@/components/tools/catalogue-prompts-intro";
import { ToolShell } from "@/components/tools/tool-shell";
import { PercentageTool } from "@/components/tools/percentage-tool";
import { VatCalculatorTool } from "@/components/tools/vat-calculator-tool";
import { WhitespaceTool } from "@/components/tools/whitespace-tool";
import { WordCounterTool } from "@/components/tools/word-counter-tool";
import { getAllOutilSlugs, getOutilBySlug } from "@/lib/content/outils";
import { getSiteUrl } from "@/lib/site";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return getAllOutilSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const outil = getOutilBySlug(slug);
  if (!outil) return { title: "Outil introuvable" };
  const url = `${getSiteUrl()}/outils/${slug}`;
  return {
    title: outil.title,
    description: outil.description,
    alternates: { canonical: `/outils/${slug}` },
    openGraph: { url, title: `${outil.title} — Tramelle`, description: outil.tagline },
  };
}

function ToolBody({ slug }: { slug: string }) {
  const outil = getOutilBySlug(slug);
  if (!outil) return null;
  if (outil.embedUrl) {
    return <EmbeddedTool src={outil.embedUrl} title={outil.title} />;
  }
  if (outil.externalUrl) {
    return <ExternalToolLinkout href={outil.externalUrl} title={outil.title} />;
  }
  switch (slug) {
    case "compteur-de-mots":
      return <WordCounterTool />;
    case "nettoyer-espaces":
      return <WhitespaceTool />;
    case "pourcentage-rapide":
      return <PercentageTool />;
    case "calcul-tva":
      return <VatCalculatorTool />;
    default:
      return null;
  }
}

export default async function OutilPage({ params }: Props) {
  const { slug } = await params;
  const outil = getOutilBySlug(slug);
  if (!outil) notFound();

  const body = ToolBody({ slug });
  if (!body) notFound();

  const isEmbedded = Boolean(outil.embedUrl);
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
          <li className="text-ink/80">{outil.title}</li>
        </ol>
      </nav>
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
      {isEmbedded ? (
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

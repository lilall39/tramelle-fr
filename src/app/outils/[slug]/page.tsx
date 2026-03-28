import { PageContainer } from "@/components/layout/page-container";
import { ToolShell } from "@/components/tools/tool-shell";
import { PercentageTool } from "@/components/tools/percentage-tool";
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
  switch (slug) {
    case "compteur-de-mots":
      return <WordCounterTool />;
    case "nettoyer-espaces":
      return <WhitespaceTool />;
    case "pourcentage-rapide":
      return <PercentageTool />;
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

  return (
    <PageContainer>
      <nav className="mb-10 text-sm text-ink/55" aria-label="Fil d’Ariane">
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
      <ToolShell title={outil.title} description={outil.description}>
        {body}
      </ToolShell>
      <p className="mt-10 max-w-2xl text-sm leading-relaxed text-ink/55">
        Astuce : ces outils fonctionnent entièrement dans votre navigateur. Rien n’est envoyé sur un serveur — pratique
        pour un brouillon, un mail, une note rapide.
      </p>
    </PageContainer>
  );
}

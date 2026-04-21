import { ContentBlocks } from "@/components/content/content-blocks";
import { PageContainer } from "@/components/layout/page-container";
import { getPublicBilletResolvedServer } from "@/lib/server/editorial-pages";
import { getSiteUrl } from "@/lib/site";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(iso));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const billet = await getPublicBilletResolvedServer(slug);
  if (!billet) return { title: "Page non disponible", robots: { index: false, follow: false } };
  const first = billet.blocks.find((b) => b.type === "p");
  const desc = first && first.type === "p" ? first.text.slice(0, 155) + (first.text.length > 155 ? "…" : "") : billet.title;
  const url = `${getSiteUrl()}/billets/${slug}`;
  return {
    title: billet.title,
    description: desc,
    alternates: { canonical: `/billets/${slug}` },
    openGraph: { url, type: "article", title: billet.title, description: desc },
  };
}

export default async function BilletPage({ params }: Props) {
  const { slug } = await params;
  const billet = await getPublicBilletResolvedServer(slug);
  if (!billet) notFound();

  return (
    <PageContainer>
      <article className="pb-8">
        <nav className="mb-10 text-lg font-bold text-ink/60" aria-label="Fil d’Ariane">
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <Link href="/billets" className="underline-offset-4 hover:text-ink hover:underline">
                Billets
              </Link>
            </li>
            <li aria-hidden className="text-ink/35">
              /
            </li>
            <li className="max-w-[min(100%,42rem)] truncate text-ink/80" aria-current="page">
              {billet.title}
            </li>
          </ol>
        </nav>
        <header className="mb-12 max-w-2xl space-y-4 border-b border-ink/[0.08] pb-10">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">Billet</p>
          <h1 className="font-editorial-serif text-[2rem] font-medium leading-tight tracking-tight text-ink sm:text-4xl sm:leading-[1.08]">
            {billet.title}
          </h1>
          <div className="flex flex-wrap gap-x-3 gap-y-1 text-sm text-ink/55">
            <time dateTime={billet.publishedAt}>{formatDate(billet.publishedAt)}</time>
            {billet.mood ? (
              <>
                <span aria-hidden>·</span>
                <span>{billet.mood}</span>
              </>
            ) : null}
          </div>
        </header>
        <div className="max-w-2xl">
          <ContentBlocks blocks={billet.blocks} />
        </div>
      </article>
    </PageContainer>
  );
}

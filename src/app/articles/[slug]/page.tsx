import { ContentBlocks } from "@/components/content/content-blocks";
import { PageContainer } from "@/components/layout/page-container";
import { getPublicArticleResolvedServer } from "@/lib/server/editorial-pages";
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
  const article = await getPublicArticleResolvedServer(slug);
  if (!article) return { title: "Page non disponible", robots: { index: false, follow: false } };
  const url = `${getSiteUrl()}/articles/${slug}`;
  return {
    title: article.title,
    description: article.deck,
    alternates: { canonical: `/articles/${slug}` },
    openGraph: {
      type: "article",
      url,
      publishedTime: article.publishedAt,
      modifiedTime: article.updatedAt ?? article.publishedAt,
      tags: article.tags,
      title: article.title,
      description: article.deck,
    },
  };
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = await getPublicArticleResolvedServer(slug);
  if (!article) notFound();

  return (
    <PageContainer>
      <article className="pb-8">
        <nav className="mb-10 text-lg font-bold text-ink/60" aria-label="Fil d’Ariane">
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <Link href="/articles" className="underline-offset-4 hover:text-ink hover:underline">
                Articles
              </Link>
            </li>
            <li aria-hidden className="text-ink/35">
              /
            </li>
            <li className="max-w-[min(100%,42rem)] truncate text-ink/80" aria-current="page">
              {article.title}
            </li>
          </ol>
        </nav>
        <header className="mb-12 max-w-3xl space-y-5 border-b border-ink/[0.08] pb-10">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">Article</p>
          <h1 className="font-editorial-serif text-[2.1rem] font-medium leading-tight tracking-tight text-ink sm:text-5xl sm:leading-[1.06]">
            {article.title}
          </h1>
          <p className="text-xl leading-relaxed text-ink/75 sm:text-[1.35rem]">{article.deck}</p>
          <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-ink/55">
            <time dateTime={article.publishedAt}>Publié le {formatDate(article.publishedAt)}</time>
            <span aria-hidden>·</span>
            <span>Lecture ~{article.readingMinutes} min</span>
          </div>
          {article.tags.length ? (
            <ul className="flex flex-wrap gap-2 pt-1">
              {article.tags.map((t) => (
                <li
                  key={t}
                  className="rounded-full border border-ink/[0.08] bg-paper-muted/90 px-3 py-1 text-xs font-medium text-ink/65"
                >
                  {t}
                </li>
              ))}
            </ul>
          ) : null}
        </header>
        <p className="mb-10 max-w-2xl text-lg leading-relaxed text-ink/80">{article.lede}</p>
        <div className="max-w-2xl">
          <ContentBlocks blocks={article.blocks} />
        </div>
      </article>
    </PageContainer>
  );
}

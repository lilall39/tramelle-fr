import { ContentBlocks } from "@/components/content/content-blocks";
import { PageContainer } from "@/components/layout/page-container";
import { getArticleBySlug } from "@/lib/content/articles";
import { getBilletBySlug } from "@/lib/content/billets";
import { getEditorialModerationStateServer } from "@/lib/server/editorial-pages";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ kind: string; slug: string }> };

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(iso));
}

function statusLabel(state: string) {
  if (state === "hidden") return "Masqué pour les visiteurs";
  if (state === "pending") return "En attente (hors index public)";
  return "Visible pour tout le monde";
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { kind, slug } = await params;
  if (kind === "article") {
    const a = getArticleBySlug(slug);
    if (!a) return { title: "Introuvable" };
    return { title: `${a.title} (aperçu admin)`, robots: { index: false, follow: false } };
  }
  if (kind === "billet") {
    const b = getBilletBySlug(slug);
    if (!b) return { title: "Introuvable" };
    return { title: `${b.title} (aperçu admin)`, robots: { index: false, follow: false } };
  }
  return { title: "Aperçu" };
}

export default async function AdminEditorialPreviewPage({ params }: Props) {
  const { kind, slug } = await params;
  if (kind !== "article" && kind !== "billet") notFound();

  const editorialKind = kind === "article" ? "article" : "billet";
  const state = await getEditorialModerationStateServer(editorialKind, slug);
  const publicPath = kind === "article" ? `/articles/${slug}` : `/billets/${slug}`;

  if (kind === "article") {
    const article = getArticleBySlug(slug);
    if (!article) notFound();

    return (
      <PageContainer>
        <div className="mb-8 space-y-4 rounded-xl border border-amber-200 bg-amber-50/90 p-4 text-sm text-ink dark:border-amber-900/50 dark:bg-amber-950/35">
          <p className="font-bold text-amber-950 dark:text-amber-100">Lecture réservée à l’administration</p>
          <p className="text-ink/80 dark:text-ink/75">
            Visibilité publique : <span className="font-bold">{statusLabel(state)}</span>
            {state !== "live" ? (
              <>
                {" "}
                — les visiteurs ne voient pas cette adresse tant que vous ne l’avez pas remise en ligne.
              </>
            ) : null}
          </p>
          <div className="flex flex-wrap gap-x-4 gap-y-2 pt-1">
            <Link href="/admin/editorial" className="font-bold text-terracotta underline underline-offset-2">
              ← Retour à la liste
            </Link>
            <a
              href={publicPath}
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-terracotta underline underline-offset-2"
            >
              Ouvrir la page publique dans un autre onglet
            </a>
          </div>
          <p className="border-t border-amber-200/80 pt-3 text-ink/75 dark:border-amber-900/40">
            Pour <span className="font-bold">modifier les mots</span> (titre, paragraphes), il faut changer le contenu dans
            les fichiers du site puis mettre en ligne une nouvelle version — ce n’est pas encore modifiable depuis cette
            page seule.
          </p>
        </div>

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

  const billet = getBilletBySlug(slug);
  if (!billet) notFound();

  return (
    <PageContainer>
      <div className="mb-8 space-y-4 rounded-xl border border-amber-200 bg-amber-50/90 p-4 text-sm text-ink dark:border-amber-900/50 dark:bg-amber-950/35">
        <p className="font-bold text-amber-950 dark:text-amber-100">Lecture réservée à l’administration</p>
        <p className="text-ink/80 dark:text-ink/75">
          Visibilité publique : <span className="font-bold">{statusLabel(state)}</span>
          {state !== "live" ? (
            <>
              {" "}
              — les visiteurs ne voient pas cette adresse tant que vous ne l’avez pas remise en ligne.
            </>
          ) : null}
        </p>
        <div className="flex flex-wrap gap-x-4 gap-y-2 pt-1">
          <Link href="/admin/editorial" className="font-bold text-terracotta underline underline-offset-2">
            ← Retour à la liste
          </Link>
          <a
            href={publicPath}
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold text-terracotta underline underline-offset-2"
          >
            Ouvrir la page publique dans un autre onglet
          </a>
        </div>
        <p className="border-t border-amber-200/80 pt-3 text-ink/75 dark:border-amber-900/40">
          Pour <span className="font-bold">modifier les mots</span> (titre, paragraphes), il faut changer le contenu dans
          les fichiers du site puis mettre en ligne une nouvelle version — ce n’est pas encore modifiable depuis cette
          page seule.
        </p>
      </div>

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

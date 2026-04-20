import { EditorialSection } from "@/components/home/editorial-section";
import { HomeOutilsBrowsePanel } from "@/components/home/home-outils-browse-panel";
import { HomeHero } from "@/components/home/home-hero";
import { PageContainer } from "@/components/layout/page-container";
import { ContentCard } from "@/components/ui/content-card";
import { JsonLd } from "@/components/seo/json-ld";
import type { BilletFrontMatter } from "@/lib/content/types";
import { homeBodyProseSizeClass } from "@/lib/home-body-prose";
import { getPublicArticlesResolvedServer, getPublicBilletsResolvedServer } from "@/lib/server/editorial-pages";
import { brand, getSiteUrl, siteName } from "@/lib/site";
import type { Metadata } from "next";
import Link from "next/link";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Accueil",
  description:
    "Tramelle : outils minuscules, articles de fond et billets personnels en français — la revue de l’utile, sans bruit ni tableau de bord.",
  alternates: { canonical: "/" },
};

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(iso));
}

function billetTeaser(blocks: BilletFrontMatter["blocks"]): string {
  const first = blocks.find((b) => b.type === "p");
  if (!first || first.type !== "p") return "";
  const text = first.text;
  return text.length <= 190 ? text : text.slice(0, 187).trimEnd() + "…";
}

export default async function HomePage() {
  const siteUrl = getSiteUrl();
  const [publicArticles, publicBillets] = await Promise.all([
    getPublicArticlesResolvedServer(),
    getPublicBilletsResolvedServer(),
  ]);

  const articlesSorted = [...publicArticles].sort(
    (x, y) => new Date(y.publishedAt).getTime() - new Date(x.publishedAt).getTime(),
  );
  const [articleUne, ...autresArticles] = articlesSorted;

  const billetsSorted = [...publicBillets].sort(
    (x, y) => new Date(y.publishedAt).getTime() - new Date(x.publishedAt).getTime(),
  );

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        url: siteUrl,
        name: siteName,
        description: brand.heroLead,
        inLanguage: "fr-FR",
        publisher: { "@id": `${siteUrl}/#org` },
      },
      {
        "@type": "Organization",
        "@id": `${siteUrl}/#org`,
        name: siteName,
        url: siteUrl,
        slogan: brand.subtitle,
      },
    ],
  };

  return (
    <>
      <JsonLd data={jsonLd} />
      <HomeHero />
      <PageContainer className="pt-14 sm:pt-20">
        <div className="space-y-28 sm:space-y-36">
          {articleUne ? (
            <section className="scroll-mt-28" aria-labelledby="une-title">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-baseline sm:justify-between">
                <h2 id="une-title" className="text-xs font-bold uppercase tracking-[0.22em] text-terracotta">
                  À la une
                </h2>
                <p className={`${homeBodyProseSizeClass} font-bold text-ink`}>Article le plus récent</p>
              </div>
              <div className="mt-6">
                <ContentCard
                  href={`/articles/${articleUne.slug}`}
                  title={articleUne.title}
                  meta={`${formatDate(articleUne.publishedAt)} · ${articleUne.readingMinutes} min de lecture`}
                  description={articleUne.deck}
                  variant="featured"
                />
              </div>
            </section>
          ) : null}

          <EditorialSection
            id="outils"
            number="01"
            eyebrow="Pratique immédiate"
            title="Outils"
            layout="descriptionBetweenNumberAndTitle"
            description="Outils en ligne gratuits, sans inscription, rapides et indépendants : zéro compte, zéro tableau de bord, sans sponsor ni affiliation. Utilisation simple et immédiate."
            titleStackHref="/outils"
          >
            <HomeOutilsBrowsePanel />
          </EditorialSection>

          <EditorialSection
            id="articles"
            number="02"
            eyebrow="Long format"
            title="Articles"
            description="Textes plus calibrés : méthode, recul, manière de voir le travail et le numérique. Ici, on prend le temps d’expliquer — sans vous traiter comme un profil à optimiser."
            footer={
              <p className={`${homeBodyProseSizeClass} text-ink/50`}>
                <Link href="/articles" className="font-bold text-terracotta underline-offset-4 transition-colors hover:text-ink hover:underline">
                  Tous les articles
                </Link>
              </p>
            }
          >
            {autresArticles.length ? (
              <ul className="grid gap-5 lg:grid-cols-2">
                {autresArticles.map((a) => (
                  <li key={a.slug}>
                    <ContentCard
                      href={`/articles/${a.slug}`}
                      title={a.title}
                      meta={`${formatDate(a.publishedAt)} · ${a.readingMinutes} min`}
                      description={a.deck}
                    />
                  </li>
                ))}
              </ul>
            ) : (
              <p className={`${homeBodyProseSizeClass} text-ink/55`}>D’autres textes arrivent bientôt.</p>
            )}
          </EditorialSection>

          <EditorialSection
            id="billets"
            number="03"
            eyebrow="Notes & voix"
            title="Billets"
            description="Plus courts, plus directs : fragments d’expérience, opinions, coulisses. Ce n’est pas la rubrique des vérités définitives — plutôt des instantanés honnêtes."
            footer={
              <p className={`${homeBodyProseSizeClass} text-ink/50`}>
                <Link href="/billets" className="font-bold text-terracotta underline-offset-4 transition-colors hover:text-ink hover:underline">
                  Tous les billets
                </Link>
              </p>
            }
          >
            <ul className="grid gap-5 lg:grid-cols-2">
              {billetsSorted.map((b) => (
                <li key={b.slug}>
                  <ContentCard
                    href={`/billets/${b.slug}`}
                    title={b.title}
                    meta={`${formatDate(b.publishedAt)}${b.mood ? ` · ${b.mood}` : ""}`}
                    description={billetTeaser(b.blocks)}
                    variant="compact"
                  />
                </li>
              ))}
            </ul>
          </EditorialSection>

          <EditorialSection
            id="offres-et-services"
            number="04"
            eyebrow="Petites annonces"
            title="Offres et recherche services"
            description="Annonces, services, ventes, dons et articles — publiés après modération, sans afficher vos coordonnées privées sur les pages publiques."
            headerHref="/publications"
            headerLinkLabel="Voir les petites annonces"
            footer={
              <p className={`${homeBodyProseSizeClass} text-ink/50`}>
                <Link
                  href="/publications"
                  className="font-bold text-terracotta underline-offset-4 transition-colors hover:text-ink hover:underline"
                >
                  Voir les publications
                </Link>
              </p>
            }
          >
            <p className={`max-w-2xl ${homeBodyProseSizeClass} text-ink/70`}>
              Créez un compte pour{" "}
              <Link
                href="/login?next=/publier"
                className="font-bold text-terracotta underline-offset-4 transition-colors hover:text-ink hover:underline"
              >
                Publier
              </Link>{" "}
              un contenu : il reste « en attente » jusqu’à validation par une équipe d’administration.
            </p>
          </EditorialSection>
        </div>
      </PageContainer>
    </>
  );
}

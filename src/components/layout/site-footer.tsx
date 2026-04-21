import Link from "next/link";
import { homeBodyProseSizeClass } from "@/lib/home-body-prose";
import { siteDomain, siteName } from "@/lib/site";

export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-auto border-t border-ink/[0.08] bg-paper-muted/60">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-5 py-14 sm:flex-row sm:items-start sm:justify-between sm:py-16">
        <div className="max-w-md space-y-3">
          <p className="font-editorial-serif text-xl font-medium text-ink">{siteName}</p>
          <p className={`${homeBodyProseSizeClass} font-bold italic text-terracotta/80`}>
            Outils en ligne gratuits, textes posés, annonces accessibles à tous.
          </p>
          <p className={`${homeBodyProseSizeClass} text-ink/65`}>
            Un site pensé comme une petite revue : des applications utiles au quotidien, des articles faits pour durer,
            et la possibilité de publier des annonces ou des contenus simplement, sans inscription — l’outil au service
            du texte, le texte au service de la clarté.
          </p>
        </div>
        <div className={`flex flex-col gap-4 ${homeBodyProseSizeClass} text-ink/60`}>
          <span className="font-mono text-xs uppercase tracking-wider text-ink/45">{siteDomain}</span>
          <nav className="flex flex-col gap-2" aria-label="Liens de pied de page">
            <Link href="/articles" className="w-fit text-ink/75 underline-offset-4 transition-colors hover:text-accent hover:underline">
              Articles
            </Link>
            <Link href="/outils" className="w-fit text-ink/75 underline-offset-4 transition-colors hover:text-accent hover:underline">
              Outils
            </Link>
            <Link href="/billets" className="w-fit text-ink/75 underline-offset-4 transition-colors hover:text-accent hover:underline">
              Billets
            </Link>
            <Link href="/a-propos" className="w-fit text-ink/75 underline-offset-4 transition-colors hover:text-accent hover:underline">
              À propos
            </Link>
          </nav>
          <p className="pt-4 text-xs text-ink/40">© {year} {siteName}</p>
        </div>
      </div>
    </footer>
  );
}

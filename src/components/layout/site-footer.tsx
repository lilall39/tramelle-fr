import Link from "next/link";
import { brand, siteDomain, siteName } from "@/lib/site";

export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-auto border-t border-ink/10 bg-paper-muted/50 dark:bg-paper-muted/30">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-5 py-14 sm:flex-row sm:items-start sm:justify-between sm:py-16">
        <div className="max-w-md space-y-3">
          <p className="font-editorial-serif text-xl font-medium text-ink">{siteName}</p>
          <p className="text-sm italic leading-relaxed text-ink/60">{brand.subtitle}</p>
          <p className="text-sm leading-relaxed text-ink/65">
            Un site personnel tenu comme une petite revue : l’outil au service du texte, le texte au service de la
            clarté — en français, pour durer.
          </p>
        </div>
        <div className="flex flex-col gap-4 text-sm text-ink/60">
          <span className="font-mono text-xs uppercase tracking-wider text-ink/45">{siteDomain}</span>
          <nav className="flex flex-col gap-2" aria-label="Liens de pied de page">
            <Link href="/articles" className="w-fit underline-offset-4 hover:text-ink hover:underline">
              Articles
            </Link>
            <Link href="/outils" className="w-fit underline-offset-4 hover:text-ink hover:underline">
              Outils
            </Link>
            <Link href="/billets" className="w-fit underline-offset-4 hover:text-ink hover:underline">
              Billets
            </Link>
            <Link href="/a-propos" className="w-fit underline-offset-4 hover:text-ink hover:underline">
              À propos
            </Link>
          </nav>
          <p className="pt-4 text-xs text-ink/40">© {year} {siteName}</p>
        </div>
      </div>
    </footer>
  );
}

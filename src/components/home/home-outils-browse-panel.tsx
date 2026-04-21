import Link from "next/link";
import { outils } from "@/lib/content/outils";

/** Retirés uniquement de ce panneau d’accueil (restent sur /outils et ailleurs). */
const EXCLUDED_ON_HOME = new Set(["pourcentage-rapide", "tva-fr", "geovelo"]);

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M5 8l5 5 5-5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function HomeOutilsBrowsePanel() {
  const listedOutils = outils.filter((o) => !EXCLUDED_ON_HOME.has(o.slug));
  const count = listedOutils.length;
  const countLabel = `${count} outil${count > 1 ? "s" : ""}`;

  return (
    <details className="group overflow-hidden rounded-2xl border border-ink/[0.08] bg-paper shadow-sm shadow-ink/[0.03] transition-[border-color,box-shadow] open:border-accent/25 open:shadow-md open:shadow-ink/[0.04]">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-4 sm:px-5 sm:py-4 [&::-webkit-details-marker]:hidden">
        <div className="min-w-0 flex-1 space-y-0.5 pr-2 text-left">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-terracotta">{countLabel}</p>
          <h3 className="font-editorial-serif text-lg font-bold tracking-tight text-ink sm:text-xl">
            Parcourir tous les outils
          </h3>
        </div>
        <span className="shrink-0 text-ink/45 transition-transform duration-200 ease-out group-open:rotate-180">
          <ChevronIcon />
        </span>
      </summary>
      <div className="border-t border-ink/[0.08] px-4 pb-4 pt-3 sm:px-5">
        <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {listedOutils.map((tool) => (
            <li key={tool.slug}>
              <Link
                href={`/outils/${tool.slug}`}
                className="util-outil-card-surface group/card flex min-h-0 flex-col rounded-lg border border-outil-title/22 px-2.5 py-2 shadow-sm shadow-black/[0.03] transition-[border-color,box-shadow] hover:border-outil-title/40 hover:shadow-md hover:shadow-black/[0.06] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-outil-title/35 sm:px-3 sm:py-2"
              >
                <span className="font-editorial-serif text-base font-bold leading-snug tracking-tight text-outil-title underline decoration-outil-title/25 decoration-1 underline-offset-[0.22em] transition-[text-decoration-color] group-hover/card:decoration-outil-title/50">
                  {tool.title}
                </span>
                <span className="mt-0.5 line-clamp-2 text-sm leading-tight text-ink/62">{tool.tagline}</span>
              </Link>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-sm text-ink/50">
          <Link
            href="/outils"
            className="font-bold text-terracotta underline-offset-4 transition-colors hover:text-ink hover:underline"
            aria-label="Voir tous les outils, par catégories, sur la page Outils"
          >
            Etc…
          </Link>
        </p>
      </div>
    </details>
  );
}

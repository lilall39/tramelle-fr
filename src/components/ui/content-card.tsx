import Link from "next/link";
import { homeBodyProseSizeClass } from "@/lib/home-body-prose";

type Props = {
  href: string;
  title: string;
  meta?: string;
  description: string;
  variant?: "default" | "compact" | "featured";
  /** Méta + accroche plus lisibles (ex. grille outils) */
  strongTeaser?: boolean;
  /** Titres des fiches outils (couleur dédiée) */
  outilTitle?: boolean;
};

export function ContentCard({
  href,
  title,
  meta,
  description,
  variant = "default",
  strongTeaser = false,
  outilTitle = false,
}: Props) {
  const titleTone = outilTitle
    ? "text-outil-title group-hover:text-[#314a62]"
    : "text-ink group-hover:text-accent";
  const shellStandard = outilTitle
    ? "util-outil-card-surface group block rounded-2xl border border-outil-title/22 px-4 py-3.5 shadow-sm shadow-black/[0.04] transition-[border-color,box-shadow] hover:border-outil-title/40 hover:shadow-md hover:shadow-black/[0.06] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-outil-title/35 sm:px-5 sm:py-4"
    : "group block rounded-2xl border border-ink/[0.08] bg-paper p-6 shadow-sm shadow-ink/[0.03] transition-[border-color,box-shadow] hover:border-accent/30 hover:shadow-md hover:shadow-ink/[0.04] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

  const shell =
    variant === "featured"
      ? "group relative block overflow-hidden rounded-2xl border border-ink/[0.08] bg-paper-elevated p-8 shadow-sm shadow-ink/[0.04] transition-[border-color,box-shadow] before:absolute before:left-0 before:top-0 before:h-full before:w-1 before:bg-accent hover:border-accent/35 hover:shadow-md hover:shadow-ink/[0.05] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      : shellStandard;

  return (
    <Link href={href} className={shell}>
      {meta ? (
        <p
          className={
            strongTeaser
              ? "mb-2 text-sm font-bold uppercase tracking-[0.18em] text-terracotta"
              : "mb-2 text-xs font-bold uppercase tracking-[0.18em] text-terracotta/90"
          }
        >
          {meta}
        </p>
      ) : null}
      <h3
        className={
          variant === "featured"
            ? `font-editorial-serif text-2xl ${strongTeaser ? "font-bold" : "font-medium"} leading-snug tracking-tight sm:text-[1.75rem] ${titleTone}`
            : variant === "compact"
              ? `font-editorial-serif text-xl ${strongTeaser ? "font-bold" : "font-medium"} tracking-tight ${titleTone}${outilTitle ? " leading-snug" : ""}`
              : `font-editorial-serif text-xl ${strongTeaser ? "font-bold" : "font-medium"} tracking-tight sm:text-[1.35rem] ${titleTone}${outilTitle ? " leading-snug" : ""}`
        }
      >
        <span
          className={
            outilTitle
              ? "underline decoration-outil-title/30 decoration-1 underline-offset-[0.28em] transition-[text-decoration-color] group-hover:decoration-outil-title/55"
              : "underline decoration-ink/[0.12] decoration-1 underline-offset-[0.28em] transition-[text-decoration-color] group-hover:decoration-accent/45"
          }
        >
          {title}
        </span>
      </h3>
      <p
        className={
          variant === "featured"
            ? `mt-4 ${homeBodyProseSizeClass} text-ink/75`
            : strongTeaser && outilTitle
              ? "mt-1.5 text-base font-normal leading-snug text-ink/75 sm:text-[1.05rem] sm:leading-snug"
              : strongTeaser
                ? `mt-3 ${homeBodyProseSizeClass} font-normal text-ink/75`
                : `mt-3 ${homeBodyProseSizeClass} text-ink/70`
        }
      >
        {description}
      </p>
    </Link>
  );
}

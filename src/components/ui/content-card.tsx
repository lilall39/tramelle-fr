import Link from "next/link";

type Props = {
  href: string;
  title: string;
  meta?: string;
  description: string;
  variant?: "default" | "compact" | "featured";
  /** Méta + accroche plus lisibles (ex. grille outils) */
  strongTeaser?: boolean;
};

export function ContentCard({
  href,
  title,
  meta,
  description,
  variant = "default",
  strongTeaser = false,
}: Props) {
  const shell =
    variant === "featured"
      ? "group relative block overflow-hidden rounded-2xl border border-ink/[0.08] bg-paper-elevated p-8 shadow-sm shadow-ink/[0.04] transition-[border-color,box-shadow] before:absolute before:left-0 before:top-0 before:h-full before:w-1 before:bg-accent hover:border-accent/35 hover:shadow-md hover:shadow-ink/[0.05] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      : "group block rounded-2xl border border-ink/[0.08] bg-paper p-6 shadow-sm shadow-ink/[0.03] transition-[border-color,box-shadow] hover:border-accent/30 hover:shadow-md hover:shadow-ink/[0.04] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

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
            ? "font-editorial-serif text-2xl font-medium leading-snug tracking-tight text-ink group-hover:text-accent sm:text-[1.75rem]"
            : variant === "compact"
              ? "font-editorial-serif text-xl font-medium tracking-tight text-ink group-hover:text-accent"
              : "font-editorial-serif text-xl font-medium tracking-tight text-ink group-hover:text-accent sm:text-[1.35rem]"
        }
      >
        <span className="underline decoration-ink/[0.12] decoration-1 underline-offset-[0.28em] transition-[text-decoration-color] group-hover:decoration-accent/45">
          {title}
        </span>
      </h3>
      <p
        className={
          variant === "featured"
            ? "mt-4 text-base leading-relaxed text-ink/75"
            : strongTeaser
              ? "mt-3 text-base font-bold leading-relaxed text-ink"
              : "mt-3 text-sm leading-relaxed text-ink/70"
        }
      >
        {description}
      </p>
    </Link>
  );
}

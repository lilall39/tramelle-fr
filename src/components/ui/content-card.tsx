import Link from "next/link";

type Props = {
  href: string;
  title: string;
  meta?: string;
  description: string;
  variant?: "default" | "compact" | "featured";
};

export function ContentCard({
  href,
  title,
  meta,
  description,
  variant = "default",
}: Props) {
  const shell =
    variant === "featured"
      ? "group relative block overflow-hidden rounded-2xl border border-ink/10 bg-paper-elevated p-8 shadow-md shadow-ink/[0.06] transition-[border-color,box-shadow] before:absolute before:left-0 before:top-0 before:h-full before:w-1 before:bg-accent/80 hover:border-accent/40 hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-strong dark:shadow-black/20"
      : "group block rounded-2xl border border-ink/10 bg-paper p-6 shadow-sm shadow-ink/5 transition-[border-color,box-shadow,transform] hover:border-accent/35 hover:shadow-md hover:shadow-ink/[0.04] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-strong";

  return (
    <Link href={href} className={shell}>
      {meta ? (
        <p className="mb-2 text-xs font-medium uppercase tracking-[0.18em] text-ink/45">
          {meta}
        </p>
      ) : null}
      <h3
        className={
          variant === "featured"
            ? "font-editorial-serif text-2xl font-medium leading-snug tracking-tight text-ink group-hover:text-accent-strong sm:text-[1.75rem]"
            : variant === "compact"
              ? "font-editorial-serif text-xl font-medium tracking-tight text-ink group-hover:text-accent-strong"
              : "font-editorial-serif text-xl font-medium tracking-tight text-ink group-hover:text-accent-strong sm:text-[1.35rem]"
        }
      >
        <span className="underline decoration-ink/15 decoration-1 underline-offset-[0.28em] transition-[text-decoration-color] group-hover:decoration-accent/50">
          {title}
        </span>
      </h3>
      <p
        className={
          variant === "featured"
            ? "mt-4 text-base leading-relaxed text-ink/75"
            : "mt-3 text-sm leading-relaxed text-ink/70"
        }
      >
        {description}
      </p>
    </Link>
  );
}

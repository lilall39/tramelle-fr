import Link from "next/link";
import type { ReactNode } from "react";
import { homeBodyProseClass } from "@/lib/home-body-prose";

type Props = {
  id: string;
  number: string;
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
  /** Si défini, le bloc numéro + titre + description mène vers cette URL (ex. liste des annonces). */
  headerHref?: string;
  /** Libellé accessible pour le lien d’en-tête (recommandé si `headerHref` est défini). */
  headerLinkLabel?: string;
  /**
   * `descriptionBetweenNumberAndTitle` : le paragraphe d’accroche est rendu entre le chiffre et le bloc
   * surlignage + titre (au lieu d’être sous le titre).
   */
  layout?: "default" | "descriptionBetweenNumberAndTitle";
  /** Lien sur le bloc surlignage + titre uniquement (sans le paragraphe de description déplacé). */
  titleStackHref?: string;
};

export function EditorialSection({
  id,
  number,
  eyebrow,
  title,
  description,
  children,
  footer,
  headerHref,
  headerLinkLabel,
  layout = "default",
  titleStackHref,
}: Props) {
  const numberSpan = (
    <span
      className="font-editorial-serif text-5xl font-bold tabular-nums leading-none text-ink"
      aria-hidden
    >
      {number}
    </span>
  );

  const descriptionP = (
    <p className={`max-w-2xl ${homeBodyProseClass}`}>{description}</p>
  );

  const titleEyebrow = (
    <p className="text-xs font-bold uppercase tracking-[0.22em] text-terracotta">{eyebrow}</p>
  );

  const titleHeadingPlain = (
    <h2 className="font-editorial-serif text-3xl font-medium tracking-tight text-ink sm:text-[2rem]">{title}</h2>
  );

  const titleHeadingLinked = (
    <h2 className="font-editorial-serif text-3xl font-medium tracking-tight text-ink underline decoration-ink/[0.15] decoration-1 underline-offset-[0.28em] transition-[text-decoration-color] sm:text-[2rem] group-hover/title:decoration-terracotta/55">
      {title}
    </h2>
  );

  const titleStack = (
    <div className="space-y-3 pt-1">
      {titleStackHref ? (
        <Link
          href={titleStackHref}
          className="group/title -mx-1 block space-y-3 rounded-md px-1 py-0.5 text-inherit no-underline outline-offset-4 transition-colors hover:bg-ink/[0.04] focus-visible:outline focus-visible:outline-2 focus-visible:outline-terracotta"
        >
          {titleEyebrow}
          {titleHeadingLinked}
        </Link>
      ) : (
        <>
          {titleEyebrow}
          {titleHeadingPlain}
        </>
      )}
      {layout === "default" ? descriptionP : null}
    </div>
  );

  const headerLead =
    layout === "descriptionBetweenNumberAndTitle" ? (
      <>
        {numberSpan}
        {descriptionP}
        {titleStack}
      </>
    ) : (
      <>
        {numberSpan}
        {titleStack}
      </>
    );

  const headerRowClass =
    layout === "descriptionBetweenNumberAndTitle"
      ? "flex flex-col gap-5 sm:flex-row sm:items-end sm:gap-8"
      : "flex gap-6 sm:gap-8";

  return (
    <section id={id} className="scroll-mt-28">
      <div className="flex flex-col gap-6 border-b border-ink/[0.08] pb-10 sm:flex-row sm:items-end sm:justify-between sm:gap-12">
        {headerHref ? (
          <Link
            href={headerHref}
            className={`${headerRowClass} -mx-2 rounded-lg bg-paper px-2 py-1 text-inherit no-underline outline-offset-4 transition-colors hover:bg-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-terracotta`}
            aria-label={headerLinkLabel ?? `Aller aux annonces — ${title}`}
          >
            {headerLead}
          </Link>
        ) : (
          <div className={headerRowClass}>{headerLead}</div>
        )}
      </div>
      <div className="pt-10">{children}</div>
      {footer ? <div className="pt-8">{footer}</div> : null}
    </section>
  );
}

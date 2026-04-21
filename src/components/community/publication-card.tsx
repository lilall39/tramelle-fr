import Link from "next/link";
import type { PublicSubmission } from "@/types/community";
import { CATEGORY_LABELS } from "@/lib/community/labels";
import { getSubmissionHeroImageUrl } from "@/lib/community/submission-images";
import { formatFirestoreDate } from "@/lib/community/format-date";

type Props = {
  submission: PublicSubmission;
  /** Sur la liste « Publications », les vignettes photo sont masquées (texte uniquement). */
  showHeroImage?: boolean;
};

function cardSummaryLine(submission: PublicSubmission): string {
  if (submission.category !== "article") return submission.description.trim();
  const sub = submission.subtitle?.trim();
  if (sub) return sub;
  const raw = submission.content?.trim() ?? "";
  if (!raw) return "";
  return raw.length <= 200 ? raw : `${raw.slice(0, 197).trimEnd()}…`;
}

export function PublicationCard({ submission, showHeroImage = true }: Props) {
  const img = showHeroImage ? getSubmissionHeroImageUrl(submission) : null;

  const categoryPill = (
    <span className="inline-flex w-fit rounded-full bg-paper-muted px-2.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider text-ink/80 dark:bg-paper-muted/80">
      {CATEGORY_LABELS[submission.category]}
    </span>
  );

  return (
    <Link
      href={`/publications/${submission.id}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-ink/[0.08] bg-white shadow-sm transition hover:border-terracotta/35 hover:shadow-md dark:border-ink/[0.12] dark:bg-paper-elevated"
    >
      {img ? (
        <div className="relative aspect-[16/10] bg-paper-muted">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={img} alt="" className="h-full w-full object-cover" />
          <span className="absolute left-3 top-3 rounded-full bg-paper/95 px-2.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider text-ink/80 shadow-sm">
            {CATEGORY_LABELS[submission.category]}
          </span>
        </div>
      ) : null}
      <div className="flex flex-1 flex-col gap-2 p-4">
        {!img ? <div className="mb-0.5">{categoryPill}</div> : null}
        <h2 className="font-editorial-serif text-lg font-bold leading-snug text-ink group-hover:text-terracotta">
          {submission.title}
        </h2>
        {submission.category === "annonce" && submission.price != null ? (
          <p className="text-base font-bold text-terracotta">{submission.price} €</p>
        ) : null}
        <p className="line-clamp-2 text-sm leading-relaxed text-ink/65">{cardSummaryLine(submission)}</p>
        <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 pt-2 text-xs font-bold text-ink/45">
          {submission.category !== "article" && submission.city?.trim() ? (
            <>
              <span>{submission.city}</span>
              <span aria-hidden>·</span>
            </>
          ) : null}
          <span>{formatFirestoreDate(submission.createdAt)}</span>
          <span aria-hidden>·</span>
          <span>{submission.displayName}</span>
        </div>
      </div>
    </Link>
  );
}

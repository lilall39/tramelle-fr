import Link from "next/link";
import type { PublicSubmission } from "@/types/community";
import { CATEGORY_LABELS } from "@/lib/community/labels";
import { formatFirestoreDate } from "@/lib/community/format-date";

type Props = {
  submission: PublicSubmission;
};

export function PublicationCard({ submission }: Props) {
  const img = submission.category === "article" ? submission.coverImage || submission.imageUrl : submission.imageUrl;

  return (
    <Link
      href={`/publications/${submission.id}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-ink/[0.08] bg-white shadow-sm transition hover:border-terracotta/35 hover:shadow-md dark:border-ink/[0.12] dark:bg-paper-elevated"
    >
      <div className="relative aspect-[16/10] bg-paper-muted">
        {img ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={img} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-sm font-bold text-ink/35">Pas d’image</div>
        )}
        <span className="absolute left-3 top-3 rounded-full bg-paper/95 px-2.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider text-ink/80 shadow-sm">
          {CATEGORY_LABELS[submission.category]}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h2 className="font-editorial-serif text-lg font-bold leading-snug text-ink group-hover:text-terracotta">
          {submission.title}
        </h2>
        <p className="line-clamp-2 text-sm leading-relaxed text-ink/65">{submission.description}</p>
        <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 pt-2 text-xs font-bold text-ink/45">
          <span>{submission.city}</span>
          <span aria-hidden>·</span>
          <span>{formatFirestoreDate(submission.createdAt)}</span>
          <span aria-hidden>·</span>
          <span>{submission.displayName}</span>
        </div>
      </div>
    </Link>
  );
}

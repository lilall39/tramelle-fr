import type { PublicSubmission, SubmissionCategory } from "@/types/community";
import { CATEGORY_LABELS } from "@/lib/community/labels";

const categoryAccent: Record<SubmissionCategory, string> = {
  annonce:
    "from-[color-mix(in_oklab,var(--color-accent)_22%,var(--color-paper))] via-paper-elevated to-[color-mix(in_oklab,var(--color-terracotta)_12%,var(--color-paper))]",
  service:
    "from-paper-elevated via-[color-mix(in_oklab,var(--color-accent)_18%,var(--color-paper))] to-paper-muted",
  vente:
    "from-paper-muted via-paper-elevated to-[color-mix(in_oklab,var(--color-terracotta)_14%,var(--color-paper))]",
  don: "from-paper-elevated via-paper-muted to-[color-mix(in_oklab,var(--color-accent)_15%,var(--color-paper))]",
  article:
    "from-[color-mix(in_oklab,var(--color-paper)_92%,var(--color-ink))] via-paper-elevated to-paper-muted",
};

type Props = {
  submission: PublicSubmission;
  gallery: string[];
};

export function PublicationMediaOrBanner({ submission, gallery }: Props) {
  const cat = submission.category;
  const label = CATEGORY_LABELS[cat];

  if (gallery.length > 0) {
    return gallery.length === 1 ? (
      <div className="overflow-hidden rounded-2xl border border-ink/[0.06] bg-paper-muted shadow-sm shadow-ink/[0.06]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={gallery[0]}
          alt=""
          className="max-h-[min(13rem,38vh)] w-full object-cover sm:max-h-[min(15rem,40vh)]"
          width={1600}
          height={900}
          sizes="(max-width: 1024px) 100vw, 70vw"
          loading="eager"
          decoding="async"
        />
      </div>
    ) : (
      <div className="grid gap-2 sm:grid-cols-2 sm:gap-3">
        {gallery.map((url, i) => (
          <div
            key={`${url}-${i}`}
            className="overflow-hidden rounded-2xl border border-ink/[0.06] bg-paper-muted shadow-sm shadow-ink/[0.06]"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={url}
              alt={`Visuel ${i + 1}`}
              className="max-h-[min(11rem,34vh)] w-full object-cover sm:max-h-[min(12rem,36vh)]"
              width={1200}
              height={900}
              sizes="(max-width: 640px) 100vw, 35vw"
              loading={i === 0 ? "eager" : "lazy"}
              decoding="async"
            />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-ink/[0.06] bg-gradient-to-br shadow-sm shadow-ink/[0.06] ${categoryAccent[cat]}`}
      aria-hidden={false}
    >
      <div
        className="pointer-events-none absolute -right-12 -top-16 h-56 w-56 rounded-full bg-white/25 blur-3xl dark:bg-white/10"
        aria-hidden
      />
      <div className="relative flex min-h-[100px] flex-col justify-center px-5 py-6 sm:min-h-[112px] sm:px-6">
        <p className="text-[0.75rem] font-extrabold uppercase tracking-[0.18em] text-terracotta">{label}</p>
        <p className="mt-1 text-xs leading-snug text-ink/50">Tramelle · publication modérée</p>
      </div>
    </div>
  );
}

"use client";

import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { PublicSubmission } from "@/types/community";
import { getPublicPublicationById } from "@/lib/community/submissions";
import { CATEGORY_LABELS } from "@/lib/community/labels";
import { formatFirestoreDate } from "@/lib/community/format-date";
import { getSiteUrl } from "@/lib/site";
import { useAuth } from "@/contexts/auth-context";
import { PublicationContactSection } from "@/components/community/contact-publication-form";
import { PublicationEmailBatchPanel } from "@/components/community/publication-email-batch-panel";
import { PublicationResponsesSection } from "@/components/community/publication-responses-section";
import { PageContainer } from "@/components/layout/page-container";
import { publicationListingBodyClass } from "@/lib/home-body-prose";
import {
  generateShareContent,
  type ShareContent,
  type ShareableSubmission,
} from "../../../core/share/generateShareContent";
import { buildShareUrl, type SharePlatform } from "../../../core/share/shareUrls";
import { buildVintedDraftText, VINTED_FR_NEW_LISTING_URL } from "../../../core/share/vintedDraft";
import { getSubmissionGalleryUrls, getSubmissionHeroImageUrl } from "@/lib/community/submission-images";
import { PublicationMediaOrBanner } from "@/components/community/publication-detail/publication-media-or-banner";
import { PublicationJsonLd } from "@/components/community/publication-detail/publication-json-ld";
import { SimilarPublications } from "@/components/community/publication-detail/similar-publications";

type Props = {
  id: string;
};

function pickShareable(submission: PublicSubmission): ShareableSubmission {
  return {
    id: submission.id,
    title: submission.title,
    status: submission.status,
  };
}

function previewImageUrl(submission: PublicSubmission): string | null {
  return getSubmissionHeroImageUrl(submission);
}

function toAbsoluteUrlOnSite(href: string): string {
  const t = href.trim();
  if (/^https?:\/\//i.test(t)) return t;
  if (t.startsWith("/")) {
    return `${getSiteUrl().replace(/\/+$/, "")}${t}`;
  }
  return t;
}

function publicationCanonicalUrl(publicationId: string): string {
  return `${getSiteUrl().replace(/\/+$/, "")}/publications/${publicationId}`;
}

function openShareEmailWithEditedBody(shareText: string): void {
  const trimmed = shareText.trim();
  const firstLine = trimmed.split(/\r?\n/)[0] ?? "Publication";
  const subject = firstLine.slice(0, 200);
  window.open(
    `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(shareText)}`,
    "_blank",
    "noopener,noreferrer",
  );
}

function openSharePlatform(shareText: string, shareUrl: string, platform: SharePlatform): void {
  try {
    if (platform === "email") {
      openShareEmailWithEditedBody(shareText);
      return;
    }
    const content: ShareContent =
      platform === "twitter"
        ? { text: shareText, url: "", hashtags: [] }
        : { text: shareText, url: shareUrl, hashtags: [] };
    const url = buildShareUrl(platform, content);
    window.open(url, "_blank", "noopener,noreferrer");
  } catch (e) {
    console.error(e);
  }
}

function sidebarPrice(s: PublicSubmission): { label: string; hint?: string } | null {
  if (s.price != null) {
    return { label: `${s.price} €`, hint: "Montant indiqué par l’annonceur" };
  }
  if (s.category === "service" && s.rate?.trim()) {
    return { label: s.rate.trim(), hint: "Tarifs & conditions à préciser ensemble" };
  }
  if (s.category === "don") {
    return { label: "Gratuit", hint: "Don — modalités avec l’annonceur" };
  }
  if (s.category === "article") {
    return null;
  }
  return { label: "Sur devis", hint: "Échangez avec l’annonceur" };
}

function excerptSummary(text: string, maxLen = 200): string {
  const t = text.trim();
  if (t.length <= maxLen) return t;
  const slice = t.slice(0, maxLen);
  const last = slice.lastIndexOf(" ");
  return (last > 36 ? slice.slice(0, last) : slice).trim() + "…";
}

/** Faits courts à scanner (hors prix déjà dans la carte latérale). */
function buildKeyPoints(s: PublicSubmission): string[] {
  const pts: string[] = [];
  if (s.category !== "article" && s.city?.trim()) pts.push(`Localisation · ${s.city}`);
  if (s.condition?.trim()) pts.push(`État · ${s.condition}`);
  if (s.availability?.trim()) pts.push(`Dispo · ${s.availability}`);
  if (s.pickupInfo?.trim()) pts.push(`Retrait · ${s.pickupInfo}`);
  if (s.serviceArea?.trim()) pts.push(`Zone · ${s.serviceArea}`);
  return pts;
}

function tariffLines(s: PublicSubmission): { label: string; value: string }[] {
  const out: { label: string; value: string }[] = [];
  if ((s.category === "annonce" || s.category === "vente") && s.price != null) {
    out.push({ label: "Prix", value: `${s.price} €` });
  }
  if (s.rate?.trim()) out.push({ label: "Tarification", value: s.rate.trim() });
  return out;
}

function modalitesLines(s: PublicSubmission): { label: string; value: string }[] {
  const out: { label: string; value: string }[] = [];
  if (s.serviceMode?.trim()) out.push({ label: "Modalités", value: s.serviceMode.trim() });
  if (s.deliveryMode?.trim()) out.push({ label: "Remise / livraison", value: s.deliveryMode.trim() });
  return out;
}

export function PublicationDetailClient({ id }: Props) {
  const { user, loading: authLoading } = useAuth();
  const [data, setData] = useState<PublicSubmission | null | undefined>(undefined);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [shareText, setShareText] = useState("");
  const [shareUrl, setShareUrl] = useState("");
  const [shareImage, setShareImage] = useState<string | null>(null);
  const [instagramNotice, setInstagramNotice] = useState<string | null>(null);
  const [vintedNotice, setVintedNotice] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getPublicPublicationById(id)
      .then((pub) => {
        if (!cancelled) setData(pub);
      })
      .catch(() => {
        if (!cancelled) setData(null);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    if (!isShareOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsShareOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isShareOpen]);

  useEffect(() => {
    if (isShareOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [isShareOpen]);

  function openShareModal(submission: PublicSubmission): void {
    const pageUrl = publicationCanonicalUrl(submission.id);
    let textBody = submission.title?.trim() ?? "";
    try {
      const content = generateShareContent(pickShareable(submission));
      textBody = content.text;
    } catch {
      /* fallback titre + lien */
    }
    setShareText(`${textBody}\n\n${pageUrl}`);
    setShareUrl(pageUrl);
    const img = previewImageUrl(submission);
    setShareImage(img ? toAbsoluteUrlOnSite(img) : null);
    setInstagramNotice(null);
    setVintedNotice(null);
    setIsShareOpen(true);
  }

  const assistInstagramShare = useCallback(async (): Promise<void> => {
    let textCopied = false;
    let imageCopied = false;

    try {
      await navigator.clipboard.writeText(shareText);
      textCopied = true;
    } catch (e) {
      console.error(e);
    }

    if (shareImage) {
      try {
        const res = await fetch(shareImage, { mode: "cors" });
        if (res.ok) {
          const blob = await res.blob();
          const type = blob.type && /^image\//i.test(blob.type) ? blob.type : "image/png";
          await navigator.clipboard.write([new ClipboardItem({ [type]: blob })]);
          imageCopied = true;
        }
      } catch (e) {
        console.error(e);
      }
    }

    if (textCopied && imageCopied) {
      setInstagramNotice("Texte et image copiés. Instagram s’ouvre : collez puis publiez.");
    } else if (textCopied) {
      setInstagramNotice("Texte copié. Instagram s’ouvre : ajoutez l’image, puis collez le texte.");
    } else if (imageCopied) {
      setInstagramNotice("Image copiée. Instagram s’ouvre : complétez le texte à la main.");
    } else {
      setInstagramNotice("Instagram s’ouvre. Si besoin, utilisez les boutons « Copier le texte » et « Copier l’image ».");
    }
    const opened = window.open("https://www.instagram.com/", "_blank", "noopener,noreferrer");
    if (!opened) {
      window.open("https://www.instagram.com/", "_blank", "noopener,noreferrer");
    }
    window.setTimeout(() => setInstagramNotice(null), 12000);
  }, [shareImage, shareText]);

  const assistVintedListing = useCallback(async (): Promise<void> => {
    if (data === undefined || data === null) return;
    try {
      const draft = buildVintedDraftText(data, shareUrl);
      await navigator.clipboard.writeText(draft);
      setVintedNotice(
        "Texte copié dans le presse-papiers. La page Vinted « vendre » s’ouvre : collez le titre puis la description, ajoutez vos photos.",
      );
      window.open(VINTED_FR_NEW_LISTING_URL, "_blank", "noopener,noreferrer");
      window.setTimeout(() => setVintedNotice(null), 12000);
    } catch (e) {
      console.error(e);
      setVintedNotice(
        "Ouverture de Vinted quand même — copiez le texte à la main depuis la zone « Texte à partager » si le presse-papiers est refusé.",
      );
      window.open(VINTED_FR_NEW_LISTING_URL, "_blank", "noopener,noreferrer");
    }
  }, [data, shareUrl]);

  async function copyModalText(): Promise<void> {
    try {
      await navigator.clipboard.writeText(shareText);
    } catch (e) {
      console.error(e);
    }
  }

  async function copyModalImage(): Promise<void> {
    if (!shareImage) return;
    try {
      const res = await fetch(shareImage, { mode: "cors" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      const type = blob.type && /^image\//i.test(blob.type) ? blob.type : "image/png";
      await navigator.clipboard.write([new ClipboardItem({ [type]: blob })]);
    } catch (e) {
      console.error(e);
      try {
        await navigator.clipboard.writeText(shareImage);
      } catch (e2) {
        console.error(e2);
      }
    }
  }

  if (data === undefined) {
    return (
      <PageContainer className="max-w-[1200px]">
        <div className="animate-pulse space-y-4">
          <div className="h-28 rounded-xl bg-paper-muted/80" />
          <div className="h-16 max-w-xl rounded-lg bg-paper-muted/60" />
          <div className="h-32 rounded-xl bg-paper-muted/50" />
        </div>
      </PageContainer>
    );
  }

  if (data === null) {
    notFound();
  }

  const s = data;
  const gallery = getSubmissionGalleryUrls(s);
  const isAuthor = Boolean(user && s.userId === user.uid);
  const showAuthorTools = !authLoading && isAuthor;
  const published = formatFirestoreDate(s.createdAt);
  const isoDate = s.createdAt.toDate().toISOString();
  const priceBlock = sidebarPrice(s);
  const descRaw = s.description.trim();
  const isArticle = s.category === "article";
  const resume = !isArticle && descRaw.length > 280 ? excerptSummary(descRaw, 210) : null;
  const keyPts = buildKeyPoints(s);
  const tarifs = tariffLines(s);
  const mods = modalitesLines(s);

  return (
    <PageContainer className="max-w-[1200px] pb-24 pt-8 sm:pb-28 sm:pt-10 lg:pb-20 lg:pt-10">
      <PublicationJsonLd submission={s} />

      <nav className="mb-4 text-xs font-bold text-ink/50 sm:mb-5" aria-label="Fil d’Ariane">
        <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <li>
            <Link href="/publications" className="transition hover:text-ink hover:underline hover:underline-offset-4">
              Publications
            </Link>
          </li>
          <li aria-hidden className="text-ink/30">
            /
          </li>
          <li className="text-ink/70">{CATEGORY_LABELS[s.category]}</li>
        </ol>
      </nav>

      <header className="relative mt-0 overflow-hidden rounded-xl border border-ink/[0.06] bg-paper-elevated shadow-sm shadow-ink/[0.06]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(800px_220px_at_10%_-30%,color-mix(in_oklab,var(--color-terracotta)_12%,transparent),transparent_50%)]" />
        <div className="relative px-4 py-4 sm:px-5 sm:py-5">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="inline-flex rounded-full border border-ink/[0.08] bg-paper/90 px-2 py-0.5 text-[0.7rem] font-extrabold uppercase tracking-[0.16em] text-terracotta">
              {CATEGORY_LABELS[s.category]}
            </span>
            <span className="inline-flex items-center rounded-full bg-ink/[0.06] px-2 py-0.5 text-[0.7rem] font-extrabold uppercase tracking-[0.14em] text-terracotta dark:bg-white/[0.08]">
              Modéré
            </span>
          </div>

          <h1 className="mt-3 max-w-[52rem] font-editorial-serif text-2xl font-bold leading-tight tracking-tight text-ink sm:text-[1.75rem] lg:text-[2rem]">
            {s.title}
          </h1>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-ink/60">
              {!isArticle && s.city?.trim() ? (
                <>
                  <span>{s.city}</span>
                  <span className="text-ink/25" aria-hidden>
                    ·
                  </span>
                </>
              ) : null}
              <time dateTime={isoDate}>{published}</time>
            </div>
            <button
              type="button"
              onClick={() => openShareModal(s)}
              className="shrink-0 rounded-lg border border-ink/[0.1] bg-paper px-3 py-1.5 text-xs font-bold text-ink transition hover:border-accent/35 hover:text-accent"
            >
              Partager
            </button>
          </div>

          {showAuthorTools ? (
            <div className="mt-4 space-y-3 border-t border-ink/[0.06] pt-4">
              <p className="text-xs font-bold text-ink/55">Vous êtes l’auteur · invitations ci-dessous</p>
              <PublicationEmailBatchPanel publicationId={s.id} />
            </div>
          ) : null}
        </div>
      </header>

      <div className="mt-4 grid gap-6 lg:grid-cols-[minmax(0,17fr)_minmax(0,8fr)] lg:items-start lg:gap-6">
        <div className="min-w-0 space-y-4 lg:space-y-5">
          <PublicationMediaOrBanner submission={s} gallery={gallery} />

          <section className="rounded-xl border border-ink/[0.06] bg-paper-elevated p-5 shadow-sm">
            <div className="divide-y divide-ink/[0.06]">
              {isArticle ? (
                <>
                  {s.subtitle ? (
                    <div className="pb-4">
                      <p className="font-editorial-serif text-lg font-bold text-ink">{s.subtitle}</p>
                    </div>
                  ) : null}
                  {s.content?.trim() ? (
                    <div className={s.subtitle ? "pt-4" : "pt-0"}>
                      <h2 className="text-xs font-extrabold uppercase tracking-[0.16em] text-terracotta">Texte</h2>
                      <div className={`mt-2 whitespace-pre-wrap ${publicationListingBodyClass} text-ink/85`}>{s.content}</div>
                    </div>
                  ) : null}
                </>
              ) : (
                <>
                  {resume ? (
                    <div className="pb-4">
                      <h2 className="text-xs font-extrabold uppercase tracking-[0.16em] text-terracotta">Résumé</h2>
                      <p className="mt-2 text-sm leading-snug text-ink/75">{resume}</p>
                    </div>
                  ) : null}
                  <div className={resume ? "py-4" : "pb-4"}>
                    <h2 className="text-xs font-extrabold uppercase tracking-[0.16em] text-terracotta">Description</h2>
                    <div
                      className={`mt-2 whitespace-pre-wrap [&_strong]:font-semibold [&_strong]:text-ink ${publicationListingBodyClass}`}
                    >
                      {descRaw}
                    </div>
                  </div>
                  {keyPts.length > 0 ? (
                    <div className="py-4">
                      <h2 className="text-xs font-extrabold uppercase tracking-[0.16em] text-terracotta">Points clés</h2>
                      <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-ink/80">
                        {keyPts.map((x) => (
                          <li key={x}>{x}</li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                  {tarifs.length > 0 ? (
                    <div className="py-4">
                      <h2 className="text-xs font-extrabold uppercase tracking-[0.16em] text-terracotta">Tarifs</h2>
                      <dl className="mt-2 space-y-1.5 text-sm">
                        {tarifs.map((row) => (
                          <div key={row.label} className="flex justify-between gap-3 border-b border-ink/[0.04] py-1 last:border-0">
                            <dt className="font-semibold text-terracotta">{row.label}</dt>
                            <dd className="font-semibold text-ink">{row.value}</dd>
                          </div>
                        ))}
                      </dl>
                    </div>
                  ) : null}
                  {mods.length > 0 ? (
                    <div className="pt-4">
                      <h2 className="text-xs font-extrabold uppercase tracking-[0.16em] text-terracotta">Modalités</h2>
                      <dl className="mt-2 space-y-2 text-sm">
                        {mods.map((row) => (
                          <div key={row.label}>
                            <dt className="text-xs font-extrabold uppercase text-terracotta">{row.label}</dt>
                            <dd className="mt-0.5 whitespace-pre-wrap text-ink/85">{row.value}</dd>
                          </div>
                        ))}
                      </dl>
                    </div>
                  ) : null}
                </>
              )}
            </div>
          </section>

          <PublicationResponsesSection
            compact
            parentSubmissionId={s.id}
            className="scroll-mt-24 rounded-xl border border-ink/[0.06] bg-paper-elevated px-4 py-4 sm:px-5"
          />

          <SimilarPublications currentId={s.id} category={s.category} />

          <p className="text-center text-xs text-ink/45">
            Une question ?{" "}
            <button type="button" className="font-bold text-accent underline-offset-2 hover:underline" onClick={() => setContactOpen(true)}>
              Contacter l’annonceur
            </button>
          </p>

          <PublicationContactSection
            submissionId={s.id}
            recipientUserId={s.userId}
            listingTitle={s.title}
            open={contactOpen}
            onOpenChange={setContactOpen}
            showIntroCard={false}
          />
        </div>

        <aside className="hidden lg:block">
          <div className="sticky top-20">
            <div className="rounded-xl border border-ink/[0.06] bg-paper-elevated p-4 shadow-md shadow-ink/[0.08]">
              {priceBlock ? (
                <div className="border-b border-ink/[0.06] pb-4">
                  <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-terracotta">
                    {s.category === "service" ? "Tarif" : "Prix"}
                  </p>
                  <p className="mt-2 font-editorial-serif text-3xl font-bold leading-none tracking-tight text-ink">
                    {priceBlock.label}
                  </p>
                  {priceBlock.hint ? <p className="mt-1.5 text-[0.7rem] leading-snug text-ink/50">{priceBlock.hint}</p> : null}
                </div>
              ) : (
                <div className="border-b border-ink/[0.06] pb-4">
                  <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-terracotta">Lecture</p>
                  <p className="mt-2 text-xs leading-snug text-ink/65">Article — réponses et partage disponibles ci-dessous.</p>
                </div>
              )}

              <div className="mt-4 space-y-2">
                <button
                  type="button"
                  onClick={() => setContactOpen(true)}
                  className="flex w-full items-center justify-center rounded-lg bg-ink py-3 text-sm font-bold text-paper shadow-md transition hover:opacity-95 dark:bg-ink/92"
                >
                  Contacter l’annonceur
                </button>
                <button
                  type="button"
                  onClick={() => openShareModal(s)}
                  className="flex w-full items-center justify-center rounded-lg border border-ink/[0.12] bg-paper py-2.5 text-sm font-bold text-ink transition hover:border-accent/35 hover:text-accent"
                >
                  Partager
                </button>
                {s.category === "service" ? (
                  <button
                    type="button"
                    onClick={() => setContactOpen(true)}
                    className="flex w-full items-center justify-center rounded-lg border border-ink/[0.08] bg-paper-muted/35 py-2.5 text-sm font-bold text-ink/90 transition hover:bg-paper-muted"
                  >
                    Demander un devis
                  </button>
                ) : null}
              </div>

              <div className="mt-4 border-t border-ink/[0.06] pt-4">
                <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-terracotta">Vendeur</p>
                <p className="mt-1 text-sm font-bold text-ink">{s.displayName}</p>
              </div>

              <div className="mt-3 rounded-lg border border-ink/[0.06] bg-paper-muted/25 p-3 text-[0.7rem] leading-snug text-ink/55">
                <p className="font-bold text-terracotta">Sécurité</p>
                <p className="mt-1">Évitez les paiements précipités ; signalez tout comportement suspect.</p>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Barre mobile */}
      <div
        className="fixed inset-x-0 bottom-0 z-[90] border-t border-ink/[0.08] bg-paper/92 px-4 py-3 backdrop-blur-md pb-[max(0.75rem,env(safe-area-inset-bottom))] lg:hidden"
        role="region"
        aria-label="Actions rapides"
      >
        <div className="mx-auto flex max-w-lg gap-3">
          <button
            type="button"
            onClick={() => setContactOpen(true)}
            className="min-h-[48px] flex-1 rounded-2xl bg-ink py-3 text-sm font-bold text-paper shadow-lg shadow-ink/25 dark:bg-ink/92"
          >
            Contacter
          </button>
          <button
            type="button"
            onClick={() => openShareModal(s)}
            className="min-h-[48px] flex-1 rounded-2xl border border-ink/[0.14] bg-paper py-3 text-sm font-bold text-ink"
          >
            Partager
          </button>
        </div>
      </div>

      {isShareOpen
        ? createPortal(
            <div data-app-portal className="fixed inset-0 z-[220] overflow-y-auto">
              <button
                type="button"
                tabIndex={-1}
                aria-label="Fermer"
                className="fixed inset-0 z-0 bg-ink/50 dark:bg-black/60"
                onClick={() => setIsShareOpen(false)}
              />
              <div className="relative z-10 flex min-h-full items-center justify-center p-4">
                <div
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="share-dialog-title"
                  aria-label="Partager cette publication"
                  className="max-h-[min(90vh,40rem)] w-full max-w-lg overflow-y-auto rounded-xl border border-ink/[0.12] bg-paper p-5 shadow-xl dark:border-ink/[0.2] dark:bg-paper-elevated"
                  onClick={(e) => e.stopPropagation()}
                >
                  <h2 id="share-dialog-title" className="font-editorial-serif text-xl font-bold text-ink">
                    Partager cette publication
                  </h2>

                  {shareImage ? (
                    <div className="mt-4 overflow-hidden rounded-lg border border-ink/[0.08] bg-paper-muted">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={shareImage} alt="" className="max-h-48 w-full object-contain" />
                    </div>
                  ) : null}

                  <p className="mt-3 text-xs text-ink/60">
                    {shareImage
                      ? "Les réseaux peuvent afficher un aperçu du lien ; utilisez « Copier l’image » si votre navigateur l’autorise."
                      : "Pas de photo sur cette annonce — le texte et le lien suffisent souvent pour un partage propre."}
                  </p>

                  <label
                    htmlFor="share-modal-url"
                    className="mt-4 block text-xs font-bold uppercase tracking-wider text-ink/50"
                  >
                    Lien de la page
                  </label>
                  <input
                    id="share-modal-url"
                    type="url"
                    readOnly
                    value={shareUrl}
                    className="mt-1 w-full rounded-md border border-ink/[0.12] bg-paper-muted/50 px-3 py-2 text-sm text-ink dark:border-ink/[0.2]"
                    aria-label="Lien public de la publication"
                  />

                  <label
                    htmlFor="share-modal-text"
                    className="mt-4 block text-xs font-bold uppercase tracking-wider text-ink/50"
                  >
                    Texte à partager
                  </label>
                  <textarea
                    id="share-modal-text"
                    value={shareText}
                    onChange={(e) => setShareText(e.target.value)}
                    rows={5}
                    className="mt-1 w-full resize-y rounded-md border border-ink/[0.12] bg-white px-3 py-2 text-sm text-ink dark:border-ink/[0.2] dark:bg-paper"
                    aria-label="Texte du message de partage, modifiable avant envoi"
                  />

                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => void copyModalText()}
                      className="rounded-md border border-ink/[0.15] bg-white px-3 py-1.5 text-xs font-bold text-ink transition hover:border-terracotta/50 hover:text-terracotta dark:border-ink/[0.2] dark:bg-paper-elevated"
                    >
                      Copier le texte
                    </button>
                    <button
                      type="button"
                      disabled={!shareImage}
                      onClick={() => void copyModalImage()}
                      className="rounded-md border border-ink/[0.15] bg-white px-3 py-1.5 text-xs font-bold text-ink transition enabled:hover:border-terracotta/50 enabled:hover:text-terracotta disabled:cursor-not-allowed disabled:opacity-45 dark:border-ink/[0.2] dark:bg-paper-elevated"
                    >
                      Copier l’image
                    </button>
                  </div>

                  <p className="mt-4 text-xs font-bold uppercase tracking-wider text-ink/45">Réseaux</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => openSharePlatform(shareText, shareUrl, "twitter")}
                      className="rounded-md border border-ink/[0.15] bg-white px-3 py-1.5 text-xs font-bold text-ink transition hover:border-terracotta/50 hover:text-terracotta dark:border-ink/[0.2] dark:bg-paper-elevated"
                    >
                      X
                    </button>
                    <button
                      type="button"
                      onClick={() => openSharePlatform(shareText, shareUrl, "facebook")}
                      className="rounded-md border border-ink/[0.15] bg-white px-3 py-1.5 text-xs font-bold text-ink transition hover:border-terracotta/50 hover:text-terracotta dark:border-ink/[0.2] dark:bg-paper-elevated"
                    >
                      Facebook
                    </button>
                    <button
                      type="button"
                      onClick={() => openSharePlatform(shareText, shareUrl, "linkedin")}
                      className="rounded-md border border-ink/[0.15] bg-white px-3 py-1.5 text-xs font-bold text-ink transition hover:border-terracotta/50 hover:text-terracotta dark:border-ink/[0.2] dark:bg-paper-elevated"
                    >
                      LinkedIn
                    </button>
                    <button
                      type="button"
                      onClick={() => void assistInstagramShare()}
                      className="rounded-md border border-ink/[0.15] bg-white px-3 py-1.5 text-xs font-bold text-ink transition hover:border-terracotta/50 hover:text-terracotta dark:border-ink/[0.2] dark:bg-paper-elevated"
                    >
                      Instagram
                    </button>
                    <button
                      type="button"
                      onClick={() => openSharePlatform(shareText, shareUrl, "email")}
                      className="rounded-md border border-ink/[0.15] bg-white px-3 py-1.5 text-xs font-bold text-ink transition hover:border-terracotta/50 hover:text-terracotta dark:border-ink/[0.2] dark:bg-paper-elevated"
                    >
                      E-mail
                    </button>
                  </div>
                  <p className="mt-2 text-[0.72rem] leading-relaxed text-ink/50">
                    Instagram n’accepte pas le pré-remplissage complet depuis un site externe : copiez le texte et l’image
                    ci-dessus puis collez-les dans votre publication Instagram.
                  </p>
                  {instagramNotice ? (
                    <p className="mt-2 text-xs font-bold leading-snug text-emerald-800 dark:text-emerald-300/90">
                      {instagramNotice}
                    </p>
                  ) : null}

                  <p className="mt-4 text-xs font-bold uppercase tracking-wider text-ink/45">Vinted</p>
                  <p className="mt-2 text-xs leading-relaxed text-ink/55">
                    Vinted ne propose pas d’import automatique depuis un site. Nous préparons un texte (titre, détails, lien
                    Tramelle) et ouvrons la page pour déposer une annonce : il reste à choisir la catégorie, la marque sur
                    Vinted et à ajouter les photos (téléchargez-les depuis Tramelle si besoin).
                  </p>
                  {vintedNotice ? (
                    <p className="mt-2 text-xs font-bold leading-snug text-emerald-800 dark:text-emerald-300/90">
                      {vintedNotice}
                    </p>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => void assistVintedListing()}
                    className="mt-3 w-full rounded-lg border border-terracotta/45 bg-terracotta/12 px-4 py-2.5 text-center text-xs font-bold text-ink transition hover:bg-terracotta/20 dark:border-terracotta/35 dark:bg-terracotta/15"
                  >
                    Vinted — copier le texte et ouvrir « Vendre »
                  </button>

                  <div className="mt-6 flex justify-end">
                    <button
                      type="button"
                      onClick={() => setIsShareOpen(false)}
                      className="rounded-md bg-ink px-4 py-2 text-sm font-bold text-paper dark:bg-ink/90"
                    >
                      Fermer
                    </button>
                  </div>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </PageContainer>
  );
}

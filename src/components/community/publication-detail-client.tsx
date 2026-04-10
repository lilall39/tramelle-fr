"use client";

import { useEffect, useState } from "react";
import { notFound } from "next/navigation";
import type { PublicSubmission } from "@/types/community";
import { getPublicPublicationById } from "@/lib/community/submissions";
import { CATEGORY_LABELS } from "@/lib/community/labels";
import { formatFirestoreDate } from "@/lib/community/format-date";
import { ContactPublicationForm } from "@/components/community/contact-publication-form";
import { PublicationResponsesSection } from "@/components/community/publication-responses-section";
import { PageContainer } from "@/components/layout/page-container";
import {
  generateShareContent,
  type ShareContent,
  type ShareableSubmission,
} from "../../../core/share/generateShareContent";
import { buildShareUrl, type SharePlatform } from "../../../core/share/shareUrls";

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
  const raw =
    submission.category === "article"
      ? submission.coverImage ?? submission.imageUrl
      : submission.imageUrl;
  if (raw == null || String(raw).trim() === "") return null;
  return String(raw);
}

async function handleNativeShare(submission: PublicSubmission): Promise<boolean> {
  if (typeof navigator === "undefined" || !navigator.share) {
    return false;
  }
  try {
    const content = generateShareContent(pickShareable(submission));
    await navigator.share({
      title: content.text,
      text: content.text,
      url: content.url,
    });
    return true;
  } catch (e) {
    console.error(e);
    return false;
  }
}

function buildModalShareContent(shareText: string, shareUrl: string): ShareContent {
  return { text: shareText, url: shareUrl, hashtags: [] };
}

function openSharePlatform(shareText: string, shareUrl: string, platform: SharePlatform): void {
  try {
    const url = buildShareUrl(platform, buildModalShareContent(shareText, shareUrl));
    window.open(url, "_blank", "noopener,noreferrer");
  } catch (e) {
    console.error(e);
  }
}

export function PublicationDetailClient({ id }: Props) {
  const [data, setData] = useState<PublicSubmission | null | undefined>(undefined);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [shareText, setShareText] = useState("");
  const [shareUrl, setShareUrl] = useState("");
  const [shareImage, setShareImage] = useState<string | null>(null);

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
    const content = generateShareContent(pickShareable(submission));
    const combined = `${content.text}\n\n${content.url}`;
    setShareText(combined);
    setShareUrl(content.url);
    setShareImage(previewImageUrl(submission));
    setIsShareOpen(true);
  }

  async function copyModalText(): Promise<void> {
    try {
      await navigator.clipboard.writeText(shareText);
      console.log("Texte copié");
    } catch (e) {
      console.error(e);
    }
  }

  if (data === undefined) {
    return (
      <PageContainer>
        <p className="text-sm text-ink/55">Chargement…</p>
      </PageContainer>
    );
  }

  if (data === null) {
    notFound();
  }

  const s = data;
  const hero =
    s.category === "article" ? s.coverImage || s.imageUrl : s.imageUrl;

  return (
    <PageContainer>
      <article className="mx-auto max-w-3xl">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-terracotta">{CATEGORY_LABELS[s.category]}</p>
        <h1 className="mt-3 font-editorial-serif text-3xl font-bold tracking-tight text-ink sm:text-4xl">{s.title}</h1>
        <p className="mt-2 text-sm text-ink/55">
          {s.displayName} · {s.city} · {formatFirestoreDate(s.createdAt)}
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-2" aria-label="Partager cette publication">
          <button
            type="button"
            onClick={() => openShareModal(s)}
            className="rounded-md border border-ink/[0.15] bg-white px-3 py-1.5 text-xs font-bold text-ink transition hover:border-terracotta/50 hover:text-terracotta dark:border-ink/[0.2] dark:bg-paper-elevated"
            aria-label="Ouvrir la fenêtre pour partager cette publication"
            title="Partager"
          >
            Partager
          </button>
          <button
            type="button"
            onClick={() => void handleNativeShare(s)}
            className="rounded-md border border-ink/[0.15] bg-white px-3 py-1.5 text-xs font-bold text-ink transition hover:border-terracotta/50 hover:text-terracotta dark:border-ink/[0.2] dark:bg-paper-elevated"
            aria-label="Ouvrir le menu de partage du téléphone ou de l’ordinateur"
            title="Partager via le système"
          >
            Partager...
          </button>
        </div>

        {hero ? (
          <div className="mt-8 overflow-hidden rounded-xl border border-ink/[0.08] bg-paper-muted">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={hero} alt="" className="w-full object-cover" />
          </div>
        ) : null}

        <div className="prose prose-neutral mt-8 max-w-none text-base leading-relaxed text-ink/85 dark:prose-invert">
          <p className="whitespace-pre-wrap">{s.description}</p>
        </div>

        {s.category === "vente" ? (
          <ul className="mt-8 space-y-1 text-sm font-bold text-ink/75">
            {s.price != null ? <li>Prix : {s.price} €</li> : null}
            {s.condition ? <li>État : {s.condition}</li> : null}
            {s.deliveryMode ? <li>Remise / livraison : {s.deliveryMode}</li> : null}
          </ul>
        ) : null}

        {s.category === "don" ? (
          <ul className="mt-8 space-y-1 text-sm font-bold text-ink/75">
            {s.availability ? <li>Disponibilité : {s.availability}</li> : null}
            {s.pickupInfo ? <li>Retrait : {s.pickupInfo}</li> : null}
          </ul>
        ) : null}

        {s.category === "service" ? (
          <ul className="mt-8 space-y-1 text-sm font-bold text-ink/75">
            {s.rate ? <li>Tarif : {s.rate}</li> : null}
            {s.serviceArea ? <li>Zone : {s.serviceArea}</li> : null}
            {s.serviceMode ? <li>Modalités : {s.serviceMode}</li> : null}
          </ul>
        ) : null}

        {s.category === "article" ? (
          <div className="mt-8 space-y-4">
            {s.subtitle ? <p className="text-lg font-bold text-ink/80">{s.subtitle}</p> : null}
            {s.content ? <div className="whitespace-pre-wrap text-sm leading-relaxed text-ink/85">{s.content}</div> : null}
          </div>
        ) : null}

        <PublicationResponsesSection parentSubmissionId={s.id} />

        <div className="mt-12 border-t border-ink/[0.08] pt-10">
          <ContactPublicationForm submissionId={s.id} recipientUserId={s.userId} />
        </div>
      </article>

      {isShareOpen ? (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/50 p-4 dark:bg-black/60"
          role="presentation"
          onClick={() => setIsShareOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="share-dialog-title"
            aria-label="Partager cette publication"
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border border-ink/[0.12] bg-paper p-5 shadow-xl dark:border-ink/[0.2] dark:bg-paper-elevated"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="share-dialog-title" className="font-editorial-serif text-xl font-bold text-ink">
              Partager cette publication
            </h2>

            {shareImage ? (
              <div className="mt-4 overflow-hidden rounded-lg border border-ink/[0.08] bg-paper-muted">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={shareImage}
                  alt="Aperçu de la publication"
                  className="max-h-48 w-full object-contain"
                />
              </div>
            ) : null}

            <p className="mt-3 text-xs text-ink/60">
              L’image sera automatiquement ajoutée lors du partage sur les réseaux qui l’affichent (aperçu Open Graph).
            </p>

            <label htmlFor="share-modal-url" className="mt-4 block text-xs font-bold uppercase tracking-wider text-ink/50">
              Lien
            </label>
            <input
              id="share-modal-url"
              type="url"
              readOnly
              value={shareUrl}
              className="mt-1 w-full rounded-md border border-ink/[0.12] bg-paper-muted/50 px-3 py-2 text-sm text-ink dark:border-ink/[0.2]"
              aria-label="Lien public de la publication"
            />

            <label htmlFor="share-modal-text" className="mt-4 block text-xs font-bold uppercase tracking-wider text-ink/50">
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
                aria-label="Copier le texte du message dans le presse-papiers"
                title="Copier le texte"
              >
                Copier le texte
              </button>
            </div>

            <p className="mt-4 text-xs font-bold uppercase tracking-wider text-ink/45">Réseaux</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => openSharePlatform(shareText, shareUrl, "twitter")}
                className="rounded-md border border-ink/[0.15] bg-white px-3 py-1.5 text-xs font-bold text-ink transition hover:border-terracotta/50 hover:text-terracotta dark:border-ink/[0.2] dark:bg-paper-elevated"
                aria-label="Partager sur X"
                title="Partager sur X"
              >
                X
              </button>
              <button
                type="button"
                onClick={() => openSharePlatform(shareText, shareUrl, "facebook")}
                className="rounded-md border border-ink/[0.15] bg-white px-3 py-1.5 text-xs font-bold text-ink transition hover:border-terracotta/50 hover:text-terracotta dark:border-ink/[0.2] dark:bg-paper-elevated"
                aria-label="Partager sur Facebook"
                title="Partager sur Facebook"
              >
                Facebook
              </button>
              <button
                type="button"
                onClick={() => openSharePlatform(shareText, shareUrl, "linkedin")}
                className="rounded-md border border-ink/[0.15] bg-white px-3 py-1.5 text-xs font-bold text-ink transition hover:border-terracotta/50 hover:text-terracotta dark:border-ink/[0.2] dark:bg-paper-elevated"
                aria-label="Partager sur LinkedIn"
                title="Partager sur LinkedIn"
              >
                LinkedIn
              </button>
              <button
                type="button"
                onClick={() => openSharePlatform(shareText, shareUrl, "email")}
                className="rounded-md border border-ink/[0.15] bg-white px-3 py-1.5 text-xs font-bold text-ink transition hover:border-terracotta/50 hover:text-terracotta dark:border-ink/[0.2] dark:bg-paper-elevated"
                aria-label="Partager par e-mail"
                title="Partager par e-mail"
              >
                E-mail
              </button>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setIsShareOpen(false)}
                className="rounded-md bg-ink px-4 py-2 text-sm font-bold text-paper dark:bg-ink/90"
                aria-label="Fermer la fenêtre de partage"
                title="Fermer"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </PageContainer>
  );
}

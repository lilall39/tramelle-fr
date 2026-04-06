"use client";

import { useEffect, useState } from "react";
import { notFound } from "next/navigation";
import type { PublicSubmission } from "@/types/community";
import { getPublicPublicationById } from "@/lib/community/submissions";
import { CATEGORY_LABELS } from "@/lib/community/labels";
import { formatFirestoreDate } from "@/lib/community/format-date";
import { ContactPublicationForm } from "@/components/community/contact-publication-form";
import { PageContainer } from "@/components/layout/page-container";

type Props = {
  id: string;
};

export function PublicationDetailClient({ id }: Props) {
  const [data, setData] = useState<PublicSubmission | null | undefined>(undefined);

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

        <div className="mt-12 border-t border-ink/[0.08] pt-10">
          <ContactPublicationForm submissionId={s.id} recipientUserId={s.userId} />
        </div>
      </article>
    </PageContainer>
  );
}

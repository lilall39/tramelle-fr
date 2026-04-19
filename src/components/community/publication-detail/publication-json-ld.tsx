"use client";

import { useMemo } from "react";
import type { PublicSubmission } from "@/types/community";
import { getSiteUrl } from "@/lib/site";

type Props = {
  submission: PublicSubmission;
};

export function PublicationJsonLd({ submission }: Props) {
  const json = useMemo(() => {
    const base = getSiteUrl().replace(/\/+$/, "");
    const url = `${base}/publications/${submission.id}`;
    const title = submission.title.trim();
    const desc =
      submission.category === "article"
        ? (
            submission.subtitle?.trim() ||
            submission.content?.trim().slice(0, 480).trim() ||
            title
          ).slice(0, 5000)
        : submission.description.trim().slice(0, 5000);
    const images: string[] = [];
    if (submission.imageUrl) {
      const u = submission.imageUrl.startsWith("http") ? submission.imageUrl : `${base}${submission.imageUrl}`;
      images.push(u);
    }
    if (submission.imageUrls?.length) {
      for (const x of submission.imageUrls) {
        if (!x) continue;
        images.push(x.startsWith("http") ? x : `${base}${x}`);
      }
    }
    const datePublished = submission.createdAt?.toDate?.()?.toISOString?.() ?? undefined;

    if (submission.category === "article") {
      return {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: title,
        description: desc,
        url,
        datePublished,
        author: { "@type": "Person", name: submission.displayName || "Anonyme" },
        publisher: { "@type": "Organization", name: "Tramelle", url: base },
        ...(images[0] ? { image: images[0] } : {}),
      };
    }

    const offer =
      submission.price != null
        ? {
            "@type": "Offer",
            price: submission.price,
            priceCurrency: "EUR",
            availability: "https://schema.org/InStock",
            url,
          }
        : {
            "@type": "Offer",
            priceCurrency: "EUR",
            availability: "https://schema.org/OnlineOnly",
            url,
          };

    return {
      "@context": "https://schema.org",
      "@type": "Product",
      name: title,
      description: desc,
      url,
      brand: { "@type": "Brand", name: "Tramelle" },
      ...(images[0] ? { image: images } : {}),
      offers: offer,
      ...(datePublished ? { datePublished } : {}),
    };
  }, [submission]);

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }} />;
}

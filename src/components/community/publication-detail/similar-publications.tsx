"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { PublicSubmission } from "@/types/community";
import { listApprovedPublications } from "@/lib/community/submissions";
import { PublicationCard } from "@/components/community/publication-card";

type Props = {
  currentId: string;
  category: PublicSubmission["category"];
};

export function SimilarPublications({ currentId, category }: Props) {
  const [items, setItems] = useState<PublicSubmission[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    listApprovedPublications()
      .then((all) => {
        if (!cancelled) setItems(all);
      })
      .catch(() => {
        if (!cancelled) setItems([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const similar = useMemo(() => {
    if (!items) return [];
    return items
      .filter((p) => p.id !== currentId && p.category === category)
      .slice(0, 3);
  }, [items, currentId, category]);

  if (similar.length === 0) return null;

  return (
    <section className="rounded-2xl border border-ink/[0.06] bg-paper-elevated p-4 shadow-sm shadow-ink/[0.03] sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-editorial-serif text-lg font-bold tracking-tight text-ink">À voir aussi</h2>
        <Link
          href="/publications"
          className="text-xs font-bold text-accent underline-offset-4 transition hover:text-ink hover:underline"
        >
          Tout voir
        </Link>
      </div>
      <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {similar.map((s) => (
          <li key={s.id}>
            <PublicationCard submission={s} showHeroImage={false} />
          </li>
        ))}
      </ul>
    </section>
  );
}

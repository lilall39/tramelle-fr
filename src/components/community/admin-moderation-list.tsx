"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { listPendingSubmissions } from "@/lib/community/submissions";
import type { Submission } from "@/types/community";
import { CATEGORY_LABELS } from "@/lib/community/labels";
import { formatFirestoreDate } from "@/lib/community/format-date";
import { PageContainer } from "@/components/layout/page-container";

export function AdminModerationList() {
  const [rows, setRows] = useState<(Submission & { id: string })[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    listPendingSubmissions()
      .then((data) => {
        if (!cancelled) setRows(data);
      })
      .catch(() => {
        if (!cancelled) setRows([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (rows === null) {
    return (
      <PageContainer>
        <p className="text-sm text-ink/55">Chargement…</p>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <h1 className="font-editorial-serif text-3xl font-bold text-ink">Modération</h1>
      <p className="mt-2 text-sm text-ink/60">Publications en attente de validation.</p>
      {rows.length === 0 ? (
        <p className="mt-10 text-sm text-ink/55">Aucune publication en attente.</p>
      ) : (
        <ul className="mt-8 space-y-3">
          {rows.map((s) => (
            <li key={s.id}>
              <Link
                href={`/admin/moderation/${s.id}`}
                className="block rounded-xl border border-ink/[0.08] bg-white p-4 transition hover:border-terracotta/40 dark:border-ink/[0.12] dark:bg-paper-elevated"
              >
                <span className="text-xs font-bold uppercase tracking-wider text-terracotta">{CATEGORY_LABELS[s.category]}</span>
                <h2 className="mt-1 font-editorial-serif text-lg font-bold text-ink">{s.title}</h2>
                <p className="mt-1 text-xs text-ink/50">{formatFirestoreDate(s.createdAt)} · {s.privateEmail}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </PageContainer>
  );
}

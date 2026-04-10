"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Response } from "@/types/community";
import { listPendingResponses } from "@/lib/community/responses-admin";
import { formatMsDate } from "@/lib/community/format-date";
import { PageContainer } from "@/components/layout/page-container";

export function AdminResponseList() {
  const [rows, setRows] = useState<(Response & { id: string })[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    listPendingResponses()
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
      <h1 className="font-editorial-serif text-3xl font-bold text-ink">Modération des réponses</h1>
      <p className="mt-2 text-sm text-ink/60">Réponses en attente de validation.</p>
      {rows.length === 0 ? (
        <p className="mt-10 text-sm text-ink/55">Aucune réponse en attente.</p>
      ) : (
        <ul className="mt-8 space-y-3">
          {rows.map((r) => (
            <li key={r.id}>
              <Link
                href={`/admin/responses/${r.id}`}
                className="block rounded-xl border border-ink/[0.08] bg-white p-4 transition hover:border-terracotta/40 dark:border-ink/[0.12] dark:bg-paper-elevated"
              >
                <p className="line-clamp-2 text-sm text-ink/85">{r.content}</p>
                <p className="mt-2 text-xs text-ink/50">
                  {formatMsDate(r.createdAt)} · parent {r.parentId.slice(0, 8)}…
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </PageContainer>
  );
}

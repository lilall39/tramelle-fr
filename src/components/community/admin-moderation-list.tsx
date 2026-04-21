"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  listPendingSubmissions,
  listSubmissionsByStatusForModeration,
} from "@/lib/community/submissions";
import type { Submission } from "@/types/community";
import { CATEGORY_LABELS } from "@/lib/community/labels";
import { formatFirestoreDate } from "@/lib/community/format-date";
import { PageContainer } from "@/components/layout/page-container";

type Rows = {
  pending: (Submission & { id: string })[];
  approved: (Submission & { id: string })[];
  rejected: (Submission & { id: string })[];
  deleted: (Submission & { id: string })[];
};

function SubmissionCard({ s }: { s: Submission & { id: string } }) {
  return (
    <li>
      <Link
        href={`/admin/moderation/${s.id}`}
        className="block rounded-xl border border-ink/[0.08] bg-white p-4 transition hover:border-terracotta/40 dark:border-ink/[0.12] dark:bg-paper-elevated"
      >
        <span className="text-xs font-bold uppercase tracking-wider text-terracotta">{CATEGORY_LABELS[s.category]}</span>
        <h2 className="mt-1 font-editorial-serif text-lg font-bold text-ink">{s.title}</h2>
        <p className="mt-1 text-xs text-ink/50">{formatFirestoreDate(s.createdAt)} · {s.privateEmail}</p>
      </Link>
    </li>
  );
}

export function AdminModerationList() {
  const [rows, setRows] = useState<Rows | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      listPendingSubmissions(),
      listSubmissionsByStatusForModeration("approved"),
      listSubmissionsByStatusForModeration("rejected"),
      listSubmissionsByStatusForModeration("deleted"),
    ])
      .then(([pending, approved, rejected, deleted]) => {
        if (!cancelled) setRows({ pending, approved, rejected, deleted });
      })
      .catch(() => {
        if (!cancelled) setRows({ pending: [], approved: [], rejected: [], deleted: [] });
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

  const { pending, approved, rejected, deleted } = rows;

  return (
    <PageContainer>
      <h1 className="font-editorial-serif text-3xl font-bold text-ink">Modération</h1>
      <p className="mt-2 text-sm text-ink/60">Publications en attente de validation.</p>
      {pending.length === 0 ? (
        <p className="mt-10 text-sm text-ink/55">Aucune publication en attente.</p>
      ) : (
        <ul className="mt-8 space-y-3">
          {pending.map((s) => (
            <SubmissionCard key={s.id} s={s} />
          ))}
        </ul>
      )}

      <section className="mt-14 border-t border-ink/[0.08] pt-10 dark:border-ink/[0.12]">
        <h2 className="font-editorial-serif text-xl font-bold text-ink">Publications en ligne</h2>
        <p className="mt-2 max-w-xl text-sm text-ink/60">
          Les annonces déjà validées n’apparaissent plus dans la liste du haut. Ouvrez une fiche ci-dessous pour retirer le contenu du site ou l’effacer définitivement.
        </p>
        {approved.length === 0 ? (
          <p className="mt-6 text-sm text-ink/55">Aucune publication en ligne pour l’instant.</p>
        ) : (
          <ul className="mt-6 space-y-3">
            {approved.map((s) => (
              <SubmissionCard key={s.id} s={s} />
            ))}
          </ul>
        )}
      </section>

      <section className="mt-12 border-t border-ink/[0.08] pt-10 dark:border-ink/[0.12]">
        <h2 className="font-editorial-serif text-xl font-bold text-ink">Publications refusées</h2>
        <p className="mt-2 text-sm text-ink/60">Vous pouvez ouvrir une fiche pour archiver ou effacer.</p>
        {rejected.length === 0 ? (
          <p className="mt-6 text-sm text-ink/55">Aucune.</p>
        ) : (
          <ul className="mt-6 space-y-3">
            {rejected.map((s) => (
              <SubmissionCard key={s.id} s={s} />
            ))}
          </ul>
        )}
      </section>

      <section className="mt-12 border-t border-ink/[0.08] pt-10 dark:border-ink/[0.12]">
        <h2 className="font-editorial-serif text-xl font-bold text-ink">Archivées (retirées du site)</h2>
        <p className="mt-2 text-sm text-ink/60">Suppression définitive possible depuis la fiche.</p>
        {deleted.length === 0 ? (
          <p className="mt-6 text-sm text-ink/55">Aucune.</p>
        ) : (
          <ul className="mt-6 space-y-3">
            {deleted.map((s) => (
              <SubmissionCard key={s.id} s={s} />
            ))}
          </ul>
        )}
      </section>
    </PageContainer>
  );
}

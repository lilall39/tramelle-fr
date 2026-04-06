"use client";

import { useEffect, useState } from "react";
import { listContactMessages } from "@/lib/community/contact";
import type { ContactMessage } from "@/types/community";
import { formatFirestoreDate } from "@/lib/community/format-date";
import { SITE_CONTACT_RECIPIENT_ID } from "@/lib/community/site-contact";
import { PageContainer } from "@/components/layout/page-container";

export function AdminMessagesList() {
  const [rows, setRows] = useState<(ContactMessage & { id: string })[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    listContactMessages()
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
      <h1 className="font-editorial-serif text-3xl font-bold text-ink">Messages</h1>
      <p className="mt-2 text-sm text-ink/60">Contacts site et publications.</p>
      {rows.length === 0 ? (
        <p className="mt-10 text-sm text-ink/55">Aucun message.</p>
      ) : (
        <ul className="mt-8 space-y-6">
          {rows.map((m) => (
            <li key={m.id} className="rounded-xl border border-ink/[0.08] bg-white p-4 text-sm dark:border-ink/[0.12] dark:bg-paper-elevated">
              <p className="text-xs text-ink/45">
                {formatFirestoreDate(m.createdAt)} · {m.status}
                {m.recipientUserId === SITE_CONTACT_RECIPIENT_ID ? " · Contact site" : ` · Destinataire ${m.recipientUserId}`}
              </p>
              {m.submissionId ? <p className="mt-1 text-xs font-bold text-terracotta">Publication : {m.submissionId}</p> : null}
              <p className="mt-2 font-bold text-ink">
                {m.senderName} — {m.senderEmail}
              </p>
              <p className="mt-2 whitespace-pre-wrap text-ink/80">{m.message}</p>
            </li>
          ))}
        </ul>
      )}
    </PageContainer>
  );
}

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { notFound } from "next/navigation";
import {
  RESPONSES_ADMIN_GATE,
  applyResponseModerationAction,
  getResponseByIdForAdmin,
} from "@/lib/community/responses-admin";
import type { Response } from "@/types/community";
import { formatMsDate } from "@/lib/community/format-date";
import { firebaseErrorHint } from "@/lib/firebase/error-hint";
import { PageContainer } from "@/components/layout/page-container";

type Props = { id: string };

export function AdminResponseDetail({ id }: Props) {
  const router = useRouter();
  const [data, setData] = useState<(Response & { id: string }) | null | undefined>(undefined);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getResponseByIdForAdmin(id, RESPONSES_ADMIN_GATE)
      .then((doc) => {
        if (!cancelled) setData(doc);
      })
      .catch(() => {
        if (!cancelled) setData(null);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  async function runAction(action: "approve" | "reject" | "delete") {
    if (!data) return;
    setActionError(null);
    setBusy(true);
    try {
      await applyResponseModerationAction(data.id, data, action);
      router.replace("/admin/responses");
      router.refresh();
    } catch (e) {
      setActionError(e instanceof Error ? e.message : firebaseErrorHint(e));
    } finally {
      setBusy(false);
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

  const r = data;

  return (
    <PageContainer>
      <p className="text-sm">
        <Link href="/admin/responses" className="font-bold text-terracotta underline">
          ← Retour à la liste des réponses
        </Link>
      </p>
      <p className="mt-6 text-xs font-bold uppercase tracking-[0.22em] text-terracotta">Réponse</p>
      <p className="mt-2 text-sm text-ink/55">{formatMsDate(r.createdAt)} · statut : {r.status}</p>
      <p className="mt-2 text-sm">
        <span className="font-bold">Publication parente :</span>{" "}
        <Link href={`/publications/${r.parentId}`} className="text-terracotta underline">
          {r.parentId}
        </Link>
      </p>

      <div className="mt-6 rounded-xl border border-ink/[0.08] bg-paper-muted/30 p-4 text-sm">
        <p className="whitespace-pre-wrap text-ink/90">{r.content}</p>
      </div>

      {actionError ? (
        <p className="mt-6 max-w-xl rounded-lg border border-red-300/80 bg-red-50 px-4 py-3 text-sm text-red-900 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
          {actionError}
        </p>
      ) : null}

      {r.status === "pending" ? (
        <div className="mt-10 flex flex-wrap gap-3">
          <button
            type="button"
            disabled={busy}
            onClick={() => void runAction("approve")}
            className="rounded-md bg-ink px-4 py-2 text-sm font-bold text-paper disabled:opacity-50"
          >
            Approuver
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => void runAction("reject")}
            className="rounded-md border border-ink/[0.2] px-4 py-2 text-sm font-bold text-ink disabled:opacity-50"
          >
            Refuser
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => void runAction("delete")}
            className="rounded-md border border-red-300/80 px-4 py-2 text-sm font-bold text-red-800 disabled:opacity-50 dark:border-red-900/50 dark:text-red-300"
          >
            Supprimer
          </button>
        </div>
      ) : r.status !== "deleted" ? (
        <div className="mt-10">
          <button
            type="button"
            disabled={busy}
            onClick={() => void runAction("delete")}
            className="text-sm font-bold text-red-700 underline decoration-red-700/40 underline-offset-2 dark:text-red-400"
          >
            Archiver (supprimer)
          </button>
        </div>
      ) : (
        <p className="mt-8 text-sm text-ink/55">Réponse supprimée.</p>
      )}
    </PageContainer>
  );
}

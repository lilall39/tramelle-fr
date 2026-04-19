"use client";

import { collection, getDocs } from "firebase/firestore";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { applyEditorialModeration } from "@/lib/community/editorial-pages";
import { getFirebaseDb } from "@/lib/firebase/services";
import type { EditorialKind } from "@/types/editorial-page";

type Item = {
  kind: EditorialKind;
  slug: string;
  title: string;
};

type RemoteState = "live" | "hidden" | "pending";

type Props = {
  items: Item[];
};

export function AdminEditorialModeration({ items }: Props) {
  const [remote, setRemote] = useState<Record<string, RemoteState> | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const makeKey = useCallback((kind: EditorialKind, slug: string) => `${kind}:${slug}`, []);

  const load = useCallback(async () => {
    try {
      const db = getFirebaseDb();
      const snap = await getDocs(collection(db, "editorialPages"));
      const map: Record<string, RemoteState> = {};
      snap.docs.forEach((d) => {
        const data = d.data() as { kind?: string; slug?: string; status?: string };
        if (
          (data.kind === "article" || data.kind === "billet") &&
          data.slug &&
          (data.status === "hidden" || data.status === "pending")
        ) {
          map[`${data.kind}:${data.slug}`] = data.status as RemoteState;
        }
      });
      setRemote(map);
    } catch {
      setRemote({});
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const rows = useMemo(() => {
    return items.map((it) => {
      const k = makeKey(it.kind, it.slug);
      const st = remote === null ? "live" : (remote[k] ?? "live");
      return { ...it, state: st };
    });
  }, [items, remote, makeKey]);

  async function onAction(it: Item, action: RemoteState): Promise<void> {
    const id = makeKey(it.kind, it.slug);
    setBusy(id);
    setError(null);
    try {
      const act = action === "live" ? "live" : action;
      await applyEditorialModeration(it.kind, it.slug, act);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Action impossible.");
    } finally {
      setBusy(null);
    }
  }

  if (remote === null) {
    return <p className="text-sm text-ink/55">Chargement des statuts…</p>;
  }

  return (
    <div className="space-y-6">
      {error ? (
        <p className="text-sm font-bold text-red-700 dark:text-red-400" role="alert">
          {error}
        </p>
      ) : null}

      <ul className="space-y-3">
        {rows.map((row) => {
          const id = makeKey(row.kind, row.slug);
          const isBusy = busy === id;
          return (
            <li
              key={id}
              className="flex flex-col gap-3 rounded-xl border border-ink/[0.08] bg-white p-4 dark:border-ink/[0.12] dark:bg-paper-elevated sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0 flex-1">
                <span className="text-xs font-bold uppercase tracking-wider text-terracotta">
                  {row.kind === "article" ? "Article" : "Billet"}
                </span>
                <h2 className="mt-1 font-editorial-serif text-lg font-bold text-ink">
                  <Link
                    href={`/admin/editorial/${row.kind}/${row.slug}`}
                    className="underline-offset-4 hover:text-terracotta hover:underline"
                  >
                    {row.title}
                  </Link>
                </h2>
                <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-sm">
                  <Link
                    href={`/admin/editorial/${row.kind}/${row.slug}`}
                    className="font-bold text-terracotta underline underline-offset-2"
                  >
                    Lire le texte (aperçu admin)
                  </Link>
                  <a
                    href={`/${row.kind === "article" ? "articles" : "billets"}/${row.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-ink/70 underline underline-offset-2 hover:text-terracotta"
                  >
                    Voir comme le public
                  </a>
                </div>
                <p className="mt-2 truncate text-xs text-ink/50">
                  /{row.kind}s/{row.slug}
                </p>
                <p className="mt-2 text-sm text-ink/65">
                  Statut :{" "}
                  <span className="font-bold text-ink">
                    {row.state === "live" && "En ligne"}
                    {row.state === "hidden" && "Masqué (hors site)"}
                    {row.state === "pending" && "En attente de validation"}
                  </span>
                </p>
              </div>
              <div className="flex shrink-0 flex-wrap gap-2">
                <button
                  type="button"
                  disabled={isBusy || row.state === "live"}
                  onClick={() => void onAction(row, "live")}
                  className="rounded-lg border border-ink/[0.12] bg-paper px-3 py-2 text-xs font-bold text-ink transition enabled:hover:border-terracotta/45 enabled:hover:text-terracotta disabled:opacity-45"
                >
                  Valider / en ligne
                </button>
                <button
                  type="button"
                  disabled={isBusy || row.state === "pending"}
                  onClick={() => void onAction(row, "pending")}
                  className="rounded-lg border border-ink/[0.12] bg-paper px-3 py-2 text-xs font-bold text-ink transition enabled:hover:border-terracotta/45 enabled:hover:text-terracotta disabled:opacity-45"
                >
                  Mettre en attente
                </button>
                <button
                  type="button"
                  disabled={isBusy || row.state === "hidden"}
                  onClick={() => void onAction(row, "hidden")}
                  className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-900 transition enabled:hover:bg-red-100 disabled:opacity-45 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-200"
                >
                  Masquer
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

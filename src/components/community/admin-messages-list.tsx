"use client";

import Link from "next/link";
import { useCallback, useEffect, useId, useState } from "react";
import { listContactMessages } from "@/lib/community/contact";
import type { ContactMessage, ContactMessageStatus } from "@/types/community";
import { formatFirestoreDate } from "@/lib/community/format-date";
import { SITE_CONTACT_RECIPIENT_ID } from "@/lib/community/site-contact";
import { PageContainer } from "@/components/layout/page-container";
import { useAuth } from "@/contexts/auth-context";

function statusLabelFr(status: ContactMessageStatus): string {
  switch (status) {
    case "new":
      return "Nouveau";
    case "read":
      return "Lu";
    case "archived":
      return "Archivé";
    case "transmitted":
      return "Transmis à l’annonceur";
    case "rejected":
      return "Refusé";
    default:
      return status;
  }
}

function isTerminalStatus(status: ContactMessageStatus): boolean {
  return status === "transmitted" || status === "rejected";
}

export function AdminMessagesList() {
  const { user } = useAuth();
  const [rows, setRows] = useState<(ContactMessage & { id: string })[] | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [bannerError, setBannerError] = useState<string | null>(null);
  const [detailMessage, setDetailMessage] = useState<(ContactMessage & { id: string }) | null>(null);
  const detailTitleId = useId();

  const reload = useCallback(async () => {
    const data = await listContactMessages();
    setRows(data);
    return data;
  }, []);

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

  async function runAction(messageId: string, action: "transmit" | "reject" | "reopen" | "delete"): Promise<void> {
    if (!user) {
      setBannerError("Connectez-vous pour agir sur les messages.");
      return;
    }
    setBannerError(null);
    setBusyId(messageId);
    try {
      const token = await user.getIdToken();
      const res = await fetch(`/api/admin/contact-messages/${encodeURIComponent(messageId)}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setBannerError(data.error ?? "L’action n’a pas pu aboutir.");
        return;
      }
      const fresh = await reload();
      setDetailMessage((prev) => {
        if (action === "delete") {
          return prev?.id === messageId ? null : prev;
        }
        if (action === "reopen" && prev?.id === messageId) {
          return fresh.find((r) => r.id === messageId) ?? null;
        }
        if (action === "transmit" || action === "reject") {
          return null;
        }
        return prev;
      });
    } catch {
      setBannerError("Problème de connexion. Réessayez.");
    } finally {
      setBusyId(null);
    }
  }

  function confirmDelete(messageId: string): void {
    if (
      !window.confirm(
        "Supprimer ce message définitivement ? Il disparaîtra de la liste et ne pourra pas être récupéré.",
      )
    ) {
      return;
    }
    void runAction(messageId, "delete");
  }

  useEffect(() => {
    if (!detailMessage) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDetailMessage(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [detailMessage]);

  useEffect(() => {
    if (!detailMessage) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [detailMessage]);

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
      {bannerError ? (
        <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-800 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-200" role="alert">
          {bannerError}
        </p>
      ) : null}
      {rows.length === 0 ? (
        <p className="mt-10 text-sm text-ink/55">Aucun message.</p>
      ) : (
        <ul className="mt-8 space-y-6">
          {rows.map((m) => (
            <li key={m.id} className="rounded-xl border border-ink/[0.08] bg-white p-4 text-sm dark:border-ink/[0.12] dark:bg-paper-elevated">
              <p className="text-xs text-ink/45">
                {formatFirestoreDate(m.createdAt)} · {statusLabelFr(m.status)}
                {m.recipientUserId === SITE_CONTACT_RECIPIENT_ID ? " · Contact site" : ` · Destinataire ${m.recipientUserId}`}
              </p>
              {m.submissionId ? (
                <p className="mt-1 text-xs font-bold text-terracotta">
                  Publication :{" "}
                  <Link
                    href={`/publications/${encodeURIComponent(m.submissionId)}`}
                    className="underline underline-offset-2 hover:text-ink"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {m.submissionId}
                  </Link>
                </p>
              ) : null}
              <p className="mt-2 font-bold text-ink">
                {m.senderName} — {m.senderEmail}
              </p>
              <p className="mt-2 line-clamp-4 whitespace-pre-wrap text-ink/80">{m.message}</p>
              <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-ink/[0.06] pt-4 dark:border-ink/[0.1]">
                <button
                  type="button"
                  onClick={() => setDetailMessage(m)}
                  className="rounded-lg border border-ink/[0.2] bg-paper-muted/40 px-4 py-2 text-xs font-bold text-ink dark:border-ink/[0.25]"
                >
                  Ouvrir et lire
                </button>
                {!isTerminalStatus(m.status) ? (
                  <>
                    {m.submissionId ? (
                      <button
                        type="button"
                        disabled={busyId === m.id}
                        onClick={() => void runAction(m.id, "transmit")}
                        className="rounded-lg bg-terracotta px-4 py-2 text-xs font-bold text-white transition hover:opacity-90 disabled:opacity-50"
                      >
                        {busyId === m.id ? "Envoi…" : "Transmettre"}
                      </button>
                    ) : (
                      <span className="text-xs text-ink/50">Contact site — pas d’envoi annonceur.</span>
                    )}
                    <button
                      type="button"
                      disabled={busyId === m.id}
                      onClick={() => void runAction(m.id, "reject")}
                      className="rounded-lg border border-ink/[0.15] px-4 py-2 text-xs font-bold text-ink dark:border-ink/[0.25]"
                    >
                      Refuser
                    </button>
                  </>
                ) : (
                  <>
                    <span className="text-xs text-ink/45">Déjà traité.</span>
                    <button
                      type="button"
                      disabled={busyId === m.id}
                      onClick={() => void runAction(m.id, "reopen")}
                      className="rounded-lg border border-terracotta/40 bg-terracotta/10 px-4 py-2 text-xs font-bold text-terracotta dark:border-terracotta/50 dark:bg-terracotta/15"
                    >
                      {busyId === m.id ? "…" : "Rouvrir le traitement"}
                    </button>
                  </>
                )}
                <button
                  type="button"
                  disabled={busyId === m.id}
                  onClick={() => confirmDelete(m.id)}
                  className="ml-auto rounded-lg px-3 py-2 text-xs font-bold text-red-700 underline-offset-2 hover:underline disabled:opacity-50 dark:text-red-400"
                >
                  Supprimer
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {detailMessage ? (
        <div
          className="fixed inset-0 z-[100] overflow-y-auto bg-ink/50 px-4 py-8 dark:bg-black/60"
          role="presentation"
          onClick={() => setDetailMessage(null)}
        >
          <div className="mx-auto flex min-h-[min(100%,calc(100vh-4rem))] w-full max-w-2xl items-center justify-center">
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby={detailTitleId}
              className="w-full shrink-0 rounded-xl border border-ink/[0.12] bg-paper shadow-xl dark:border-ink/[0.2] dark:bg-paper-elevated"
              onClick={(ev) => ev.stopPropagation()}
            >
              <div className="border-b border-ink/[0.08] px-5 py-4 dark:border-ink/[0.12]">
                <h2 id={detailTitleId} className="font-editorial-serif text-lg font-bold text-ink">
                  Vérifier le message
                </h2>
                <p className="mt-1 text-xs text-ink/50">
                  {formatFirestoreDate(detailMessage.createdAt)} · {statusLabelFr(detailMessage.status)}
                </p>
                {detailMessage.submissionId ? (
                  <p className="mt-2 text-sm">
                    <span className="text-ink/55">Annonce : </span>
                    <Link
                      href={`/publications/${encodeURIComponent(detailMessage.submissionId)}`}
                      className="font-bold text-terracotta underline underline-offset-2"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Voir la publication en ligne
                    </Link>
                  </p>
                ) : null}
                <p className="mt-2 text-sm font-bold text-ink">
                  {detailMessage.senderName} — {detailMessage.senderEmail}
                </p>
              </div>
              <div className="max-h-[min(55vh,22rem)] overflow-y-auto px-5 py-4 sm:max-h-[min(60vh,26rem)]">
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-ink/90">{detailMessage.message}</p>
              </div>
              {!isTerminalStatus(detailMessage.status) ? (
                <div className="flex flex-wrap gap-2 border-t border-ink/[0.08] bg-paper-muted/30 px-5 py-4 dark:border-ink/[0.12] dark:bg-paper-muted/20">
                  {detailMessage.submissionId ? (
                    <button
                      type="button"
                      disabled={busyId === detailMessage.id}
                      onClick={() => void runAction(detailMessage.id, "transmit")}
                      className="rounded-lg bg-terracotta px-4 py-2.5 text-xs font-bold text-white transition hover:opacity-90 disabled:opacity-50"
                    >
                      {busyId === detailMessage.id ? "Envoi…" : "Transmettre à l’annonceur"}
                    </button>
                  ) : (
                    <p className="w-full text-xs text-ink/55">Contact site — pas d’envoi annonceur.</p>
                  )}
                  <button
                    type="button"
                    disabled={busyId === detailMessage.id}
                    onClick={() => void runAction(detailMessage.id, "reject")}
                    className="rounded-lg border border-ink/[0.15] px-4 py-2.5 text-xs font-bold text-ink dark:border-ink/[0.25]"
                  >
                    Refuser
                  </button>
                  <button
                    type="button"
                    onClick={() => setDetailMessage(null)}
                    className="ml-auto rounded-lg px-3 py-2.5 text-xs font-bold text-ink/60 underline-offset-2 hover:text-ink hover:underline"
                  >
                    Fermer
                  </button>
                  <button
                    type="button"
                    disabled={busyId === detailMessage.id}
                    onClick={() => confirmDelete(detailMessage.id)}
                    className="rounded-lg px-3 py-2.5 text-xs font-bold text-red-700 underline-offset-2 hover:underline disabled:opacity-50 dark:text-red-400"
                  >
                    Supprimer
                  </button>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2 border-t border-ink/[0.08] px-5 py-4 dark:border-ink/[0.12]">
                  <button
                    type="button"
                    disabled={busyId === detailMessage.id}
                    onClick={() => void runAction(detailMessage.id, "reopen")}
                    className="rounded-lg border border-terracotta/40 bg-terracotta/10 px-4 py-2 text-xs font-bold text-terracotta dark:border-terracotta/50 dark:bg-terracotta/15"
                  >
                    {busyId === detailMessage.id ? "…" : "Rouvrir le traitement"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setDetailMessage(null)}
                    className="rounded-lg border border-ink/[0.15] px-4 py-2 text-xs font-bold text-ink dark:border-ink/[0.25]"
                  >
                    Fermer
                  </button>
                  <button
                    type="button"
                    disabled={busyId === detailMessage.id}
                    onClick={() => confirmDelete(detailMessage.id)}
                    className="ml-auto rounded-lg px-3 py-2 text-xs font-bold text-red-700 underline-offset-2 hover:underline disabled:opacity-50 dark:text-red-400"
                  >
                    Supprimer
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </PageContainer>
  );
}

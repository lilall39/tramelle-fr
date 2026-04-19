"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { createContactMessage } from "@/lib/community/contact";

const MIN_MESSAGE_LEN = 15;
const SUBMIT_COOLDOWN_MS = 45_000;

function isValidEmail(value: string): boolean {
  const v = value.trim();
  if (!v) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

type Props = {
  submissionId: string;
  recipientUserId: string;
  listingTitle: string;
  /** Mode contrôlé : un seul portail, boutons d’ouverture ailleurs (sidebar, barre mobile). */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Faux = modale seule (les libellés + succès restent gérés ici). */
  showIntroCard?: boolean;
};

export function PublicationContactSection({
  submissionId,
  recipientUserId,
  listingTitle,
  open: openControlled,
  onOpenChange,
  showIntroCard = true,
}: Props) {
  const [openUncontrolled, setOpenUncontrolled] = useState(false);
  const isControlled = onOpenChange != null;
  const open = isControlled ? Boolean(openControlled) : openUncontrolled;
  const setOpen = useCallback(
    (next: boolean) => {
      if (isControlled) onOpenChange(next);
      else setOpenUncontrolled(next);
    },
    [isControlled, onOpenChange],
  );
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  /** Honeypot — doit rester vide */
  const [hp, setHp] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "ok" | "err">("idle");
  const [fieldError, setFieldError] = useState<string | null>(null);
  const lastSubmitAt = useRef(0);
  const firstFieldRef = useRef<HTMLInputElement>(null);
  const titleId = useId();
  const descId = useId();

  const close = useCallback(() => {
    setOpen(false);
    setFieldError(null);
  }, [setOpen]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => firstFieldRef.current?.focus(), 50);
    return () => window.clearTimeout(t);
  }, [open]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (status === "sending") return;
    setFieldError(null);

    const fn = firstName.trim();
    const em = email.trim();
    const msg = message.trim();

    if (!fn || !em || !msg) {
      setFieldError("Remplissez tous les champs.");
      return;
    }
    if (!isValidEmail(em)) {
      setFieldError("Indiquez une adresse e-mail valide.");
      return;
    }
    if (msg.length < MIN_MESSAGE_LEN) {
      setFieldError(`Le message doit contenir au moins ${MIN_MESSAGE_LEN} caractères.`);
      return;
    }

    const now = Date.now();
    if (now - lastSubmitAt.current < SUBMIT_COOLDOWN_MS) {
      setFieldError("Merci d’attendre un peu avant un nouvel envoi.");
      return;
    }

    if (hp.trim() !== "") {
      lastSubmitAt.current = now;
      setMessage("");
      setHp("");
      setStatus("ok");
      setOpen(false);
      return;
    }

    setStatus("sending");
    try {
      await createContactMessage({
        submissionId,
        recipientUserId,
        recipientEmail: "",
        senderName: fn,
        senderEmail: em,
        senderPhone: "",
        message: msg,
      });
      lastSubmitAt.current = Date.now();
      setFirstName("");
      setEmail("");
      setMessage("");
      setOpen(false);
      setStatus("ok");
    } catch {
      setStatus("err");
    }
  }

  return (
    <>
      {showIntroCard ? (
        <section
          className="rounded-2xl border border-ink/[0.08] bg-paper-muted/30 p-6 sm:p-8 dark:border-ink/[0.12]"
          aria-labelledby="contact-annonceur-title"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 id="contact-annonceur-title" className="font-editorial-serif text-xl font-bold text-ink">
                Contacter l’annonceur
              </h2>
              <p className="mt-1 text-sm text-ink/60">
                Gratuit <span aria-hidden>•</span> Sans inscription <span aria-hidden>•</span> Message vérifié avant
                transmission
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setFieldError(null);
                setStatus("idle");
                setOpen(true);
              }}
              className="shrink-0 rounded-lg bg-ink px-5 py-2.5 text-sm font-bold text-paper transition hover:opacity-90 dark:bg-ink/90"
            >
              Contacter l’annonceur
            </button>
          </div>
        </section>
      ) : null}

      {open
        ? createPortal(
            <div data-app-portal className="fixed inset-0 z-[200] overflow-y-auto">
              <button
                type="button"
                tabIndex={-1}
                aria-label="Fermer la fenêtre"
                className="fixed inset-0 z-0 bg-ink/50 dark:bg-black/60"
                onClick={() => close()}
              />
              <div className="relative z-10 flex min-h-full items-center justify-center p-4">
                <div
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby={titleId}
                  aria-describedby={descId}
                  className="flex w-full max-w-lg max-h-[min(92vh,40rem)] flex-col overflow-hidden rounded-xl border border-ink/[0.12] bg-paper shadow-xl dark:border-ink/[0.2] dark:bg-paper-elevated"
                  onClick={(ev) => ev.stopPropagation()}
                >
              <div className="shrink-0 px-5 pt-5">
                <h3 id={titleId} className="font-editorial-serif text-xl font-bold text-ink">
                  Contacter l’annonceur
                </h3>
                <p id={descId} className="mt-2 text-sm text-ink/65">
                  Gratuit, sans compte. Votre message est d’abord examiné par Tramelle avant d’être transmis à
                  l’annonceur.
                </p>
                <p className="mt-1 text-xs text-ink/45">
                  Annonce : <span className="font-semibold text-ink/70">{listingTitle}</span>
                </p>
              </div>

              <form
                onSubmit={(e) => void onSubmit(e)}
                className="flex min-h-0 flex-1 flex-col overflow-hidden"
              >
                <div className="relative min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain px-5 pt-4">
                  <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden="true">
                    <label htmlFor="contact-hp">Ne pas remplir</label>
                    <input
                      id="contact-hp"
                      type="text"
                      name="company_website"
                      tabIndex={-1}
                      autoComplete="off"
                      value={hp}
                      onChange={(ev) => setHp(ev.target.value)}
                    />
                  </div>

                  <label className="block text-sm font-bold text-ink">
                    Prénom
                    <input
                      ref={firstFieldRef}
                      required
                      autoComplete="given-name"
                      value={firstName}
                      onChange={(ev) => setFirstName(ev.target.value)}
                      className="mt-1 w-full rounded-md border border-ink/[0.12] bg-white px-3 py-2 text-sm text-ink dark:border-ink/[0.18] dark:bg-paper-elevated"
                    />
                  </label>
                  <label className="block text-sm font-bold text-ink">
                    E-mail
                    <input
                      type="email"
                      required
                      autoComplete="email"
                      value={email}
                      onChange={(ev) => setEmail(ev.target.value)}
                      className="mt-1 w-full rounded-md border border-ink/[0.12] bg-white px-3 py-2 text-sm text-ink dark:border-ink/[0.18] dark:bg-paper-elevated"
                    />
                  </label>
                  <label className="block text-sm font-bold text-ink">
                    Message
                    <textarea
                      required
                      minLength={MIN_MESSAGE_LEN}
                      rows={5}
                      value={message}
                      onChange={(ev) => setMessage(ev.target.value)}
                      className="mt-1 min-h-[6rem] w-full resize-y rounded-md border border-ink/[0.12] bg-white px-3 py-2 text-sm text-ink dark:border-ink/[0.18] dark:bg-paper-elevated"
                      aria-describedby="contact-msg-hint"
                    />
                    <span id="contact-msg-hint" className="mt-1 block text-xs font-normal text-ink/50">
                      Minimum {MIN_MESSAGE_LEN} caractères.
                    </span>
                  </label>

                  {fieldError ? (
                    <p className="text-sm font-bold text-red-700 dark:text-red-400" role="alert">
                      {fieldError}
                    </p>
                  ) : null}

                  {status === "err" ? (
                    <p className="text-sm font-bold text-red-700 dark:text-red-400" role="alert">
                      Échec de l’envoi. Réessayez plus tard.
                    </p>
                  ) : null}
                </div>

                <div className="shrink-0 border-t border-ink/[0.08] bg-paper px-5 py-4 dark:border-ink/[0.12] dark:bg-paper-elevated">
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="submit"
                      disabled={status === "sending"}
                      className="rounded-md bg-ink px-4 py-2.5 text-sm font-bold text-paper transition hover:opacity-90 disabled:opacity-50 dark:bg-ink/90"
                    >
                      {status === "sending" ? "Envoi…" : "Envoyer"}
                    </button>
                    <button
                      type="button"
                      onClick={() => close()}
                      className="rounded-md border border-ink/[0.15] px-4 py-2.5 text-sm font-bold text-ink dark:border-ink/[0.25]"
                    >
                      Annuler
                    </button>
                    <button
                      type="button"
                      onClick={() => close()}
                      className="ml-auto text-sm font-bold text-ink/60 underline-offset-2 hover:text-ink hover:underline"
                    >
                      Fermer
                    </button>
                  </div>
                </div>
              </form>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}

      {status === "ok" && !open ? (
        <p
          className={
            showIntroCard
              ? "mt-6 rounded-lg border border-terracotta/25 bg-paper-muted/50 px-4 py-3 text-sm font-bold text-ink dark:border-terracotta/35"
              : "rounded-xl border border-terracotta/25 bg-paper-muted/50 px-4 py-3 text-sm font-bold text-ink dark:border-terracotta/35"
          }
        >
          Votre message a été envoyé à Tramelle pour vérification. S’il est conforme, il sera transmis à l’annonceur.
        </p>
      ) : null}
    </>
  );
}

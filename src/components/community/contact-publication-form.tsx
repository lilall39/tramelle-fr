"use client";

import { useState } from "react";
import { createContactMessage } from "@/lib/community/contact";

type Props = {
  submissionId: string;
  recipientUserId: string;
};

export function ContactPublicationForm({ submissionId, recipientUserId }: Props) {
  const [senderName, setSenderName] = useState("");
  const [senderEmail, setSenderEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "ok" | "err">("idle");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!senderName.trim() || !senderEmail.trim() || !message.trim()) return;
    setStatus("sending");
    try {
      await createContactMessage({
        submissionId,
        recipientUserId,
        recipientEmail: "",
        senderName: senderName.trim(),
        senderEmail: senderEmail.trim(),
        senderPhone: "",
        message: message.trim(),
      });
      setStatus("ok");
      setMessage("");
    } catch {
      setStatus("err");
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-xl border border-ink/[0.08] bg-paper-muted/40 p-5 dark:border-ink/[0.12]">
      <h2 className="text-sm font-bold uppercase tracking-[0.18em] text-terracotta">Contacter</h2>
      <p className="text-sm text-ink/60">
        Votre message est transmis à l’auteur et aux équipes de modération (structure prévue — pas d’e-mail automatique pour l’instant).
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block text-sm font-bold text-ink">
          Nom
          <input
            required
            value={senderName}
            onChange={(ev) => setSenderName(ev.target.value)}
            className="mt-1 w-full rounded-md border border-ink/[0.12] bg-white px-3 py-2 text-sm text-ink dark:bg-paper-elevated"
          />
        </label>
        <label className="block text-sm font-bold text-ink">
          E-mail
          <input
            type="email"
            required
            value={senderEmail}
            onChange={(ev) => setSenderEmail(ev.target.value)}
            className="mt-1 w-full rounded-md border border-ink/[0.12] bg-white px-3 py-2 text-sm text-ink dark:bg-paper-elevated"
          />
        </label>
      </div>
      <label className="block text-sm font-bold text-ink">
        Message
        <textarea
          required
          rows={4}
          value={message}
          onChange={(ev) => setMessage(ev.target.value)}
          className="mt-1 w-full rounded-md border border-ink/[0.12] bg-white px-3 py-2 text-sm text-ink dark:bg-paper-elevated"
        />
      </label>
      <button
        type="submit"
        disabled={status === "sending"}
        className="rounded-md bg-ink px-4 py-2.5 text-sm font-bold text-paper transition hover:opacity-90 disabled:opacity-50"
      >
        {status === "sending" ? "Envoi…" : "Envoyer"}
      </button>
      {status === "ok" ? <p className="text-sm font-bold text-terracotta">Message envoyé.</p> : null}
      {status === "err" ? (
        <p className="text-sm font-bold text-red-700 dark:text-red-400">Échec de l’envoi. Réessayez plus tard.</p>
      ) : null}
    </form>
  );
}

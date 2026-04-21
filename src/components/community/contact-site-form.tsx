"use client";

import { useState } from "react";
import { createContactMessage } from "@/lib/community/contact";
import { SITE_CONTACT_RECIPIENT_ID } from "@/lib/community/site-contact";

export function ContactSiteForm() {
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
        submissionId: null,
        recipientUserId: SITE_CONTACT_RECIPIENT_ID,
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

  const inputClass =
    "mt-1 w-full rounded-md border border-ink/[0.12] bg-white px-3 py-2 text-sm dark:bg-paper-elevated";

  return (
    <form onSubmit={onSubmit} className="mt-8 max-w-xl space-y-4">
      <label className="block text-sm font-bold text-ink">
        Nom
        <input required value={senderName} onChange={(ev) => setSenderName(ev.target.value)} className={inputClass} />
      </label>
      <label className="block text-sm font-bold text-ink">
        E-mail
        <input type="email" required value={senderEmail} onChange={(ev) => setSenderEmail(ev.target.value)} className={inputClass} />
      </label>
      <label className="block text-sm font-bold text-ink">
        Message
        <textarea required rows={5} value={message} onChange={(ev) => setMessage(ev.target.value)} className={inputClass} />
      </label>
      <button
        type="submit"
        disabled={status === "sending"}
        className="rounded-md bg-ink px-4 py-2.5 text-sm font-bold text-paper transition hover:opacity-90 disabled:opacity-50"
      >
        {status === "sending" ? "Envoi…" : "Envoyer"}
      </button>
      {status === "ok" ? <p className="text-sm font-bold text-terracotta">Message enregistré.</p> : null}
      {status === "err" ? (
        <p className="text-sm font-bold text-red-700 dark:text-red-400">Échec de l’envoi. Réessayez plus tard.</p>
      ) : null}
    </form>
  );
}

import type { EmailProviderConfig, SendEmailPayload, SendEmailResult } from "./types";

async function sendViaResend(
  config: Extract<EmailProviderConfig, { kind: "resend" }>,
  payload: SendEmailPayload,
): Promise<SendEmailResult> {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: config.from,
      to: payload.to,
      subject: payload.subject,
      text: payload.text,
    }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    let detail = errText || `HTTP ${res.status}`;
    try {
      const j = JSON.parse(errText) as { message?: string; name?: string };
      if (typeof j.message === "string" && j.message.trim()) {
        detail = j.message.trim();
      }
    } catch {
      /* garder le corps brut */
    }
    return { ok: false, error: detail };
  }

  return { ok: true };
}

/**
 * Point d’entrée unique pour un envoi — ajouter un `case` par fournisseur.
 */
export async function sendEmail(
  providerConfig: EmailProviderConfig,
  payload: SendEmailPayload,
): Promise<SendEmailResult> {
  switch (providerConfig.kind) {
    case "resend":
      return sendViaResend(providerConfig, payload);
  }
}

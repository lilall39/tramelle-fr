import { EMAIL_BATCH_MAX_RECIPIENTS } from "./constants";
import type {
  EmailBatchAudience,
  EmailContent,
  EmailProviderConfig,
  SendEmailBatchResult,
} from "./types";
import { sendEmail } from "./sendEmail";

export { EMAIL_BATCH_MAX_RECIPIENTS } from "./constants";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmailAddress(raw: string): boolean {
  return EMAIL_RE.test(raw.trim().toLowerCase());
}

/**
 * Découpe une saisie utilisateur (retours à la ligne, virgules, points-virgules).
 */
export function parseRecipientList(input: string): string[] {
  const parts = input
    .split(/[\s,;]+/g)
    .map((s) => s.trim().toLowerCase())
    .filter((s) => s.length > 0);
  return [...new Set(parts)];
}

/**
 * Envoie le même contenu à plusieurs destinataires, un appel fournisseur par adresse
 * (erreurs isolées, pas d’échec global si une adresse échoue).
 * Audience : `manual_paste` aujourd’hui — prévoir `opt_in_list` quand une base confirmée existera.
 */
export async function sendEmailBatch(
  emails: string[],
  content: EmailContent,
  providerConfig: EmailProviderConfig,
  options?: { maxRecipients?: number; audience?: EmailBatchAudience },
): Promise<SendEmailBatchResult> {
  const max = options?.maxRecipients ?? EMAIL_BATCH_MAX_RECIPIENTS;
  const audience: EmailBatchAudience = options?.audience ?? "manual_paste";

  if (emails.length > max) {
    throw new Error(
      `Trop de destinataires : ${emails.length} (maximum autorisé par envoi : ${max}).`,
    );
  }

  const results: SendEmailBatchResult["results"] = [];
  let succeeded = 0;
  let failed = 0;

  for (const to of emails) {
    if (!isValidEmailAddress(to)) {
      failed += 1;
      results.push({ to, ok: false, error: "Adresse e-mail invalide." });
      console.warn("[email-batch] skip invalid:", to);
      continue;
    }

    const r = await sendEmail(providerConfig, {
      to,
      subject: content.subject,
      text: content.textBody,
    });

    if (r.ok) {
      succeeded += 1;
      results.push({ to, ok: true });
      console.info("[email-batch] sent:", to);
    } else {
      failed += 1;
      const err = "error" in r ? r.error : "Erreur inconnue.";
      results.push({ to, ok: false, error: err });
      console.warn("[email-batch] failed:", to, err);
    }
  }

  return {
    audience,
    attempted: emails.length,
    succeeded,
    failed,
    results,
  };
}

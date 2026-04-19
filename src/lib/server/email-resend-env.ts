import type { EmailProviderConfig } from "@core/email/types";

/** Variables : `RESEND_API_KEY`, `EMAIL_FROM` (expéditeur vérifié chez le fournisseur). */
function stripOuterQuotes(s: string): string {
  const t = s.trim();
  if (
    (t.startsWith('"') && t.endsWith('"')) ||
    (t.startsWith("'") && t.endsWith("'"))
  ) {
    return t.slice(1, -1).trim();
  }
  return t;
}

export function getResendProviderFromEnv(): Extract<EmailProviderConfig, { kind: "resend" }> | null {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const fromRaw = process.env.EMAIL_FROM?.trim();
  if (!apiKey || !fromRaw) return null;
  const from = stripOuterQuotes(fromRaw);
  if (!from) return null;
  return { kind: "resend", apiKey, from };
}

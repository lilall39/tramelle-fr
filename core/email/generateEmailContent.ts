import { buildPublicUrl } from "@/app/publications/[id]/publication-meta";
import type { EmailContent, EmailableSubmission } from "./types";

function excerpt(text: string, max: number): string {
  const t = text.trim();
  if (!t) return "";
  return t.length > max ? `${t.slice(0, max - 1)}…` : t;
}

/**
 * Prépare sujet, corps texte et URL publique pour un envoi groupé.
 * Ne produit un résultat que si la publication est au statut « approved ».
 */
export function generateEmailContent(submission: EmailableSubmission): EmailContent {
  if (submission.status !== "approved") {
    throw new Error(
      "L’envoi par e-mail groupé n’est autorisé que pour les publications au statut « approved ».",
    );
  }

  const title = (submission.title ?? "").trim() || "Publication";
  const publicationUrl = buildPublicUrl({ id: submission.id });
  const desc = excerpt(submission.description ?? "", 280);

  const lines: string[] = [
    `Bonjour,`,
    ``,
    `Je vous partage cette publication sur Tramelle : ${title}`,
    ``,
    publicationUrl,
  ];
  if (desc) {
    lines.push(``, desc);
  }
  lines.push(``, `—`, `Tramelle`);
  const textBody = lines.join("\n");

  const subject = `[Tramelle] ${title}`;

  return {
    subject,
    textBody,
    publicationUrl,
  };
}

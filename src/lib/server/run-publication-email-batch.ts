import { generateEmailContent } from "@core/email/generateEmailContent";
import { parseRecipientList, sendEmailBatch } from "@core/email/sendEmailBatch";
import type { SendEmailBatchResult } from "@core/email/types";
import { getResendProviderFromEnv } from "@/lib/server/email-resend-env";
import {
  getFirebaseAdminApp,
  getSubmissionByIdForServer,
  verifyFirebaseIdToken,
} from "@/lib/firebase/admin-server";

export type PublicationEmailBatchOutcome =
  | { ok: true; result: SendEmailBatchResult }
  | { ok: false; status: number; message: string };

/**
 * Flux serveur uniquement : auteur de la publication + statut approved + fournisseur configuré.
 * Aucun envoi automatique : déclenché par l’action utilisateur côté API.
 */
export async function runPublicationEmailBatch(params: {
  publicationId: string;
  idToken: string;
  recipientsText: string;
}): Promise<PublicationEmailBatchOutcome> {
  if (!getFirebaseAdminApp()) {
    return {
      ok: false,
      status: 503,
      message:
        "Vérification serveur indisponible : définissez FIREBASE_SERVICE_ACCOUNT_JSON_BASE64 (recommandé) ou FIREBASE_SERVICE_ACCOUNT_JSON avec le JSON du compte de service.",
    };
  }

  const provider = getResendProviderFromEnv();
  if (!provider) {
    return {
      ok: false,
      status: 503,
      message:
        "Envoi d’e-mails : ajoute RESEND_API_KEY et EMAIL_FROM (service Resend, voir resend.com) dans les variables d’environnement du déploiement.",
    };
  }

  const auth = await verifyFirebaseIdToken(params.idToken);
  if (!auth) {
    return { ok: false, status: 401, message: "Session invalide ou expirée. Reconnectez-vous." };
  }

  const submission = await getSubmissionByIdForServer(params.publicationId);
  if (!submission) {
    return { ok: false, status: 404, message: "Publication introuvable." };
  }

  if (submission.userId !== auth.uid) {
    return {
      ok: false,
      status: 403,
      message: "Seul l’auteur de la publication peut envoyer cet e-mail groupé.",
    };
  }

  if (submission.status !== "approved") {
    return {
      ok: false,
      status: 400,
      message: "L’envoi n’est possible que pour une publication déjà publiée (approuvée).",
    };
  }

  const emails = parseRecipientList(params.recipientsText);
  if (emails.length === 0) {
    return { ok: false, status: 400, message: "Ajoutez au moins une adresse e-mail valide." };
  }

  let content;
  try {
    content = generateEmailContent({
      id: submission.id,
      title: submission.title,
      description: submission.description,
      status: submission.status,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Publication non éligible à l’envoi.";
    return { ok: false, status: 400, message };
  }

  try {
    const result = await sendEmailBatch(emails, content, provider, {
      audience: "manual_paste",
    });
    return { ok: true, result };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Échec de l’envoi.";
    const status = message.includes("maximum") || message.includes("Trop de destinataires") ? 400 : 500;
    return { ok: false, status, message };
  }
}

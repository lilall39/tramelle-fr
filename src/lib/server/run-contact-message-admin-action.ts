import { FieldValue, getFirestore } from "firebase-admin/firestore";
import { sendEmail } from "@core/email/sendEmail";
import { getResendProviderFromEnv } from "@/lib/server/email-resend-env";
import {
  getContactMessageByIdForServer,
  getFirebaseAdminApp,
  getSubmissionByIdForServer,
  getUserRoleForServer,
  verifyFirebaseIdToken,
} from "@/lib/firebase/admin-server";
import { getSiteUrl, siteName } from "@/lib/site";

export type ContactMessageAdminActionOutcome =
  | { ok: true }
  | { ok: false; status: number; message: string };

function isTerminalStatus(status: string): boolean {
  return status === "transmitted" || status === "rejected";
}

function buildReplyMailto(senderEmail: string): string {
  const sub = encodeURIComponent("Réponse à votre message via Tramelle");
  return `mailto:${encodeURIComponent(senderEmail.trim())}?subject=${sub}`;
}

export async function runContactMessageAdminAction(params: {
  messageId: string;
  idToken: string;
  action: "transmit" | "reject" | "reopen" | "delete";
}): Promise<ContactMessageAdminActionOutcome> {
  if (!getFirebaseAdminApp()) {
    return {
      ok: false,
      status: 503,
      message:
        "Vérification serveur indisponible : définissez FIREBASE_SERVICE_ACCOUNT_JSON_BASE64 (recommandé) ou FIREBASE_SERVICE_ACCOUNT_JSON avec le JSON du compte de service.",
    };
  }

  const auth = await verifyFirebaseIdToken(params.idToken);
  if (!auth) {
    return { ok: false, status: 401, message: "Session invalide ou expirée. Reconnectez-vous." };
  }

  const role = await getUserRoleForServer(auth.uid);
  if (role !== "admin") {
    return { ok: false, status: 403, message: "Accès réservé aux administrateurs." };
  }

  const msg = await getContactMessageByIdForServer(params.messageId);
  if (!msg) {
    return { ok: false, status: 404, message: "Message introuvable." };
  }

  const app = getFirebaseAdminApp()!;
  const db = getFirestore(app);
  const ref = db.collection("contactMessages").doc(params.messageId);

  if (params.action === "delete") {
    await ref.delete();
    return { ok: true };
  }

  if (params.action === "reopen") {
    if (!isTerminalStatus(msg.status)) {
      return {
        ok: false,
        status: 400,
        message: "Ce message est déjà en attente : vous pouvez transmettre ou refuser.",
      };
    }
    await ref.update({
      status: "new",
      transmittedAt: FieldValue.delete(),
    });
    return { ok: true };
  }

  if (isTerminalStatus(msg.status)) {
    return {
      ok: false,
      status: 400,
      message:
        "Ce message est déjà traité. Utilisez « Rouvrir le traitement » pour le remettre en attente.",
    };
  }

  if (params.action === "reject") {
    await ref.update({
      status: "rejected",
    });
    return { ok: true };
  }

  if (!msg.submissionId) {
    return {
      ok: false,
      status: 400,
      message:
        "Seuls les messages liés à une annonce peuvent être transmis à un annonceur par e-mail.",
    };
  }

  const provider = getResendProviderFromEnv();
  if (!provider) {
    return {
      ok: false,
      status: 503,
      message:
        "Envoi d’e-mails : ajoutez RESEND_API_KEY et EMAIL_FROM (service Resend) dans les variables d’environnement du déploiement.",
    };
  }

  const submission = await getSubmissionByIdForServer(msg.submissionId);
  if (!submission) {
    return { ok: false, status: 404, message: "Publication liée introuvable." };
  }

  const to = submission.privateEmail?.trim();
  if (!to || !to.includes("@")) {
    return {
      ok: false,
      status: 400,
      message: "L’annonceur n’a pas d’adresse e-mail valide enregistrée sur cette publication.",
    };
  }

  const listingTitle = submission.title?.trim() || "Sans titre";
  const replyMailto = buildReplyMailto(msg.senderEmail);
  const siteUrl = getSiteUrl();

  const textBody = [
    "Bonjour,",
    "",
    "Un internaute vous a contacté via Tramelle. Voici le message validé par l’équipe :",
    "",
    `Annonce : ${listingTitle}`,
    `De : ${msg.senderName}`,
    `E-mail : ${msg.senderEmail}`,
    "",
    "Message :",
    msg.message,
    "",
    `Pour répondre directement : ${replyMailto}`,
    "",
    `— ${siteName}`,
    siteUrl,
  ].join("\n");

  const subject = "Nouveau message reçu sur Tramelle pour votre annonce";

  const sendResult = await sendEmail(provider, {
    to,
    subject,
    text: textBody,
  });

  if (!sendResult.ok) {
    return {
      ok: false,
      status: 500,
      message: sendResult.error || "L’envoi de l’e-mail a échoué.",
    };
  }

  await ref.update({
    status: "transmitted",
    transmittedAt: FieldValue.serverTimestamp(),
  });

  return { ok: true };
}

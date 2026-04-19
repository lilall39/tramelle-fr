import type { SubmissionStatus } from "@/types/community";

/** Données minimales pour générer le contenu (statut vérifié dans generateEmailContent). */
export type EmailableSubmission = {
  id: string;
  title?: string;
  description?: string;
  status: SubmissionStatus;
};

/** Contenu prêt à l’envoi (une fois la publication validée « approved »). */
export type EmailContent = {
  subject: string;
  textBody: string;
  publicationUrl: string;
};

/** Charge utile d’un envoi unitaire — indépendante du fournisseur. */
export type SendEmailPayload = {
  to: string;
  subject: string;
  text: string;
};

/** Configuration fournisseur : étendre avec de nouveaux `kind` sans changer l’API métier. */
export type EmailProviderConfig =
  | {
      kind: "resend";
      apiKey: string;
      from: string;
    };

export type SendEmailResult =
  | { ok: true }
  | { ok: false; error: string };

/** Origine de la liste — manuel aujourd’hui ; `opt_in` pour segmentation / stats futures. */
export type EmailBatchAudience = "manual_paste" | "opt_in_list";

export type EmailBatchItemResult = {
  to: string;
  ok: boolean;
  error?: string;
};

export type SendEmailBatchResult = {
  audience: EmailBatchAudience;
  attempted: number;
  succeeded: number;
  failed: number;
  results: EmailBatchItemResult[];
};

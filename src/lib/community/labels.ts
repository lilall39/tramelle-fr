import type { SubmissionCategory, SubmissionStatus } from "@/types/community";

export const CATEGORY_LABELS: Record<SubmissionCategory, string> = {
  annonce: "Annonce",
  service: "Service",
  vente: "Vente",
  don: "Don",
  article: "Article",
};

export const STATUS_LABELS: Record<SubmissionStatus, string> = {
  pending: "En attente de modération",
  approved: "Publiée",
  rejected: "Refusée",
};

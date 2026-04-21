import type { Timestamp } from "firebase/firestore";

export function formatFirestoreDate(ts: Timestamp | undefined | null): string {
  if (!ts || typeof ts.toDate !== "function") return "—";
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(ts.toDate());
}

/** Date stockée en millisecondes (ex. réponses). */
export function formatMsDate(ms: number): string {
  if (!Number.isFinite(ms)) return "—";
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(ms));
}

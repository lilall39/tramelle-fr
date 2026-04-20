import type { PublicSubmission } from "@/types/community";

/** Page officielle pour créer une annonce (connexion Vinted si besoin). */
export const VINTED_FR_NEW_LISTING_URL = "https://www.vinted.fr/items/new";

const MAX_CHARS = 4500;

/**
 * Texte propre à coller sur Vinted (sans en-têtes techniques).
 */
export function buildVintedDraftText(submission: PublicSubmission, canonicalPageUrl: string): string {
  const lines: string[] = [];

  lines.push(submission.title.trim());
  const details: string[] = [];

  const city = submission.city?.trim();
  if (city) details.push(`Lieu : ${city}`);

  if (submission.category === "vente" || submission.category === "annonce") {
    if (submission.price != null) details.push(`Prix : ${submission.price} €`);
  }
  if (submission.category === "service" && submission.rate?.trim()) {
    details.push(`Tarif : ${submission.rate.trim()}`);
  }
  if (submission.category === "don") {
    if (submission.availability?.trim()) details.push(`Disponibilité : ${submission.availability.trim()}`);
    if (submission.pickupInfo?.trim()) details.push(`Retrait : ${submission.pickupInfo.trim()}`);
  }
  if (submission.category === "vente") {
    if (submission.condition?.trim()) details.push(`État : ${submission.condition.trim()}`);
    if (submission.deliveryMode?.trim()) details.push(`Remise / envoi : ${submission.deliveryMode.trim()}`);
  }
  if (submission.category === "service") {
    if (submission.serviceArea?.trim()) details.push(`Zone : ${submission.serviceArea.trim()}`);
    if (submission.serviceMode?.trim()) details.push(`Modalités : ${submission.serviceMode.trim()}`);
  }

  let mainText = "";
  if (submission.category === "article") {
    const parts = [submission.subtitle?.trim(), submission.content?.trim(), submission.description?.trim()].filter(
      Boolean,
    ) as string[];
    mainText = parts.join("\n\n");
  } else {
    mainText = submission.description?.trim() ?? "";
  }

  if (mainText) {
    lines.push("");
    lines.push(mainText);
  }

  if (details.length > 0) {
    lines.push("");
    lines.push(details.join(" · "));
  }

  lines.push("");
  lines.push(`Lien annonce Tramelle : ${canonicalPageUrl}`);

  let out = lines.join("\n");
  // Filet de sécurité : retire d'anciens en-têtes si une vieille version revient via cache.
  out = out
    .replace(/— À coller dans « Titre » sur Vinted —\s*/g, "")
    .replace(/— À coller dans « Décrivez votre article » —\s*/g, "")
    .replace(/Catégorie sur Tramelle :[^\n]*\n?/g, "")
    .replace(/Sur Vinted : ajoutez vos photos[^\n]*\n?/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  if (out.length > MAX_CHARS) {
    out = out.slice(0, MAX_CHARS - 1).trimEnd() + "…";
  }
  return out;
}

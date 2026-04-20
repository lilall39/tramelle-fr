import type { PublicSubmission } from "@/types/community";
import { CATEGORY_LABELS } from "@/lib/community/labels";

/** Page officielle pour créer une annonce (connexion Vinted si besoin). */
export const VINTED_FR_NEW_LISTING_URL = "https://www.vinted.fr/items/new";

const MAX_CHARS = 4500;

/**
 * Texte à coller dans la description Vinted (titre à copier séparément en premier bloc si besoin).
 */
export function buildVintedDraftText(submission: PublicSubmission, canonicalPageUrl: string): string {
  const lines: string[] = [];

  lines.push("— À coller dans « Titre » sur Vinted —");
  lines.push(submission.title.trim());
  lines.push("");
  lines.push("— À coller dans « Décrivez votre article » —");
  lines.push("");
  lines.push(`Catégorie sur Tramelle : ${CATEGORY_LABELS[submission.category]}.`);

  const city = submission.city?.trim();
  if (city) lines.push(`Lieu : ${city}.`);

  if (submission.category === "vente" || submission.category === "annonce") {
    if (submission.price != null) lines.push(`Prix affiché sur Tramelle : ${submission.price} €.`);
  }
  if (submission.category === "service" && submission.rate?.trim()) {
    lines.push(`Tarif / conditions : ${submission.rate.trim()}.`);
  }
  if (submission.category === "don") {
    if (submission.availability?.trim()) lines.push(`Disponibilité : ${submission.availability.trim()}.`);
    if (submission.pickupInfo?.trim()) lines.push(`Retrait : ${submission.pickupInfo.trim()}.`);
  }
  if (submission.category === "vente") {
    if (submission.condition?.trim()) lines.push(`État : ${submission.condition.trim()}.`);
    if (submission.deliveryMode?.trim()) lines.push(`Remise / envoi : ${submission.deliveryMode.trim()}.`);
  }
  if (submission.category === "service") {
    if (submission.serviceArea?.trim()) lines.push(`Zone : ${submission.serviceArea.trim()}.`);
    if (submission.serviceMode?.trim()) lines.push(`Modalités : ${submission.serviceMode.trim()}.`);
  }

  lines.push("");

  let mainText = "";
  if (submission.category === "article") {
    const parts = [submission.subtitle?.trim(), submission.content?.trim(), submission.description?.trim()].filter(
      Boolean,
    ) as string[];
    mainText = parts.join("\n\n");
  } else {
    mainText = submission.description?.trim() ?? "";
  }

  if (!mainText) mainText = "(Complétez avec vos détails ; voir aussi la page Tramelle ci-dessous.)";
  lines.push(mainText);

  lines.push("");
  lines.push(`Lien annonce Tramelle : ${canonicalPageUrl}`);
  lines.push("");
  lines.push(
    "Sur Vinted : ajoutez vos photos, choisissez la catégorie et la marque adaptées à l’article, puis collez ce texte dans la description et adaptez si besoin.",
  );

  let out = lines.join("\n");
  if (out.length > MAX_CHARS) {
    out = out.slice(0, MAX_CHARS - 1).trimEnd() + "…";
  }
  return out;
}

/**
 * Formats image acceptés pour les publications (alignés sur la validation front et l’upload Storage).
 */
export const SUBMISSION_IMAGE_ACCEPT =
  "image/png,image/jpeg,image/webp,.png,.jpg,.jpeg,.webp" as const;

const ALLOWED_MIME = new Set(["image/png", "image/jpeg", "image/webp"]);

const EXT_TO_MIME: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
};

/** Taille max raisonnable pour éviter échecs Storage / navigateur (modifiable). */
export const SUBMISSION_IMAGE_MAX_BYTES = 12 * 1024 * 1024;

function extensionMime(file: File): string | null {
  const name = file.name.toLowerCase();
  const dot = name.lastIndexOf(".");
  if (dot < 0) return null;
  const ext = name.slice(dot);
  return EXT_TO_MIME[ext] ?? null;
}

export type ImageValidation =
  | { ok: true; contentType: string }
  | { ok: false; message: string };

/**
 * Valide le fichier choisi (type MIME ou extension) et retourne le type à envoyer à Storage.
 */
export function validateSubmissionImage(file: File): ImageValidation {
  if (file.size > SUBMISSION_IMAGE_MAX_BYTES) {
    return {
      ok: false,
      message: `Image trop lourde (max. ${Math.round(SUBMISSION_IMAGE_MAX_BYTES / (1024 * 1024))} Mo).`,
    };
  }

  const fromType = file.type?.trim().toLowerCase();
  if (fromType && ALLOWED_MIME.has(fromType)) {
    return { ok: true, contentType: fromType };
  }

  const fromExt = extensionMime(file);
  if (fromExt) {
    return { ok: true, contentType: fromExt };
  }

  if (fromType && fromType.startsWith("image/")) {
    return {
      ok: false,
      message: "Format non pris en charge. Utilise PNG, JPEG ou WebP.",
    };
  }

  return {
    ok: false,
    message: "Fichier image invalide ou format non reconnu (PNG, JPEG, WebP).",
  };
}

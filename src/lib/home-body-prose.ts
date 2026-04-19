/** Taille et interlignage du paragraphe d’accroche sous le titre du hero (référence pour le corps sur l’accueil et équivalents). */
export const homeBodyProseSizeClass = "text-lg leading-[1.65] sm:text-xl sm:leading-[1.6]";

/** Même chose + teinte type hero. */
export const homeBodyProseClass = `${homeBodyProseSizeClass} text-ink/78`;

/**
 * Corps long sur une fiche annonce : plus compact que l’accueil pour limiter la hauteur tout en gardant une lecture confortable.
 */
export const publicationListingBodyClass =
  "text-[0.9375rem] leading-snug tracking-[-0.01em] text-ink/[0.88] sm:text-base sm:leading-[1.45]";

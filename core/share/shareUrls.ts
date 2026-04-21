import type { ShareContent } from "./generateShareContent";

export type SharePlatform = "twitter" | "facebook" | "linkedin" | "instagram" | "email";

/** Texte + hashtags « #tag » séparés par des espaces (sans encoder ici). */
function buildShareTextBody(content: ShareContent): string {
  const hashtagPart = content.hashtags.map((h) => `#${h}`).join(" ");
  if (!content.text && !hashtagPart) return "";
  if (!content.text) return hashtagPart;
  if (!hashtagPart) return content.text;
  return `${content.text} ${hashtagPart}`;
}

export function buildShareUrl(platform: SharePlatform, content: ShareContent): string {
  const textBody = buildShareTextBody(content);
  const encodedText = encodeURIComponent(textBody);
  const encodedUrl = encodeURIComponent(content.url);

  switch (platform) {
    case "twitter":
      return `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`;
    case "facebook":
      return `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
    case "linkedin":
      return `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
    case "instagram":
      return "https://www.instagram.com/";
    case "email": {
      const encodedSubject = encodeURIComponent(content.text);
      const bodyRaw = `${content.text}${content.url}`;
      const encodedBody = encodeURIComponent(bodyRaw);
      return `mailto:?subject=${encodedSubject}&body=${encodedBody}`;
    }
    default: {
      const _exhaustive: never = platform;
      void _exhaustive;
      throw new Error(`Plateforme de partage inconnue ou non prise en charge : ${String(platform)}`);
    }
  }
}

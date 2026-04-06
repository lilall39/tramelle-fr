/** Réponse minimale de l’API LanguageTool (v2/check). */
export type LTMatch = {
  offset: number;
  length: number;
  replacements: { value: string }[];
};

export type LTCheckResponse = {
  matches: LTMatch[];
};

const LT_CHECK_URL = "https://api.languagetool.org/v2/check";

export async function checkFrenchText(text: string): Promise<LTCheckResponse> {
  const params = new URLSearchParams();
  params.set("text", text);
  params.set("language", "fr");

  const res = await fetch(LT_CHECK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8" },
    body: params.toString(),
  });

  if (!res.ok) {
    const errBody = await res.text().catch(() => "");
    throw new Error(`LanguageTool ${res.status}${errBody ? `: ${errBody.slice(0, 200)}` : ""}`);
  }

  return res.json() as Promise<LTCheckResponse>;
}

/** Applique les remplacements du dernier offset au premier pour garder les indices valides. */
export function applyMatches(original: string, matches: LTMatch[]): string {
  const usable = matches.filter((m) => m.replacements?.length && m.length > 0);
  const sorted = [...usable].sort((a, b) => b.offset - a.offset);
  let result = original;
  for (const m of sorted) {
    const rep = m.replacements[0].value;
    const { offset, length } = m;
    if (offset < 0 || offset + length > result.length) continue;
    result = result.slice(0, offset) + rep + result.slice(offset + length);
  }
  return result;
}

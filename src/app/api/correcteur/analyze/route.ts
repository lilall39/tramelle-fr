import { NextResponse } from "next/server";
import { applyMatches, checkFrenchText } from "@/lib/correcteur/languagetool";

export const maxDuration = 60;

const MAX_CHARS = 12_000;

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Corps JSON invalide." }, { status: 400 });
  }

  const text = typeof body === "object" && body !== null && "text" in body ? String((body as { text: unknown }).text) : "";

  if (!text.trim()) {
    return NextResponse.json({ error: "Texte vide." }, { status: 400 });
  }

  if (text.length > MAX_CHARS) {
    return NextResponse.json(
      { error: `Texte trop long (max. ${MAX_CHARS} caractères).` },
      { status: 400 },
    );
  }

  try {
    const data = await checkFrenchText(text);
    const corrected_text = applyMatches(text, data.matches ?? []);
    return NextResponse.json({ corrected_text });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Erreur de correction.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}

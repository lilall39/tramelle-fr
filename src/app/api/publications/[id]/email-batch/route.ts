import { NextResponse, type NextRequest } from "next/server";
import { runPublicationEmailBatch } from "@/lib/server/run-publication-email-batch";

export const runtime = "nodejs";

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const authHeader = req.headers.get("authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7).trim() : null;
  if (!token) {
    return NextResponse.json({ error: "Authentification requise." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  const recipientsText =
    typeof body === "object" &&
    body !== null &&
    "recipientsText" in body &&
    typeof (body as { recipientsText?: unknown }).recipientsText === "string"
      ? (body as { recipientsText: string }).recipientsText
      : "";

  const outcome = await runPublicationEmailBatch({
    publicationId: id,
    idToken: token,
    recipientsText,
  });

  if (!outcome.ok) {
    return NextResponse.json({ error: outcome.message }, { status: outcome.status });
  }

  return NextResponse.json({ result: outcome.result });
}

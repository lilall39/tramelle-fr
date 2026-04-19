import { NextResponse, type NextRequest } from "next/server";
import { runContactMessageAdminAction } from "@/lib/server/run-contact-message-admin-action";

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

  const rawAction =
    typeof body === "object" && body !== null && "action" in body
      ? (body as { action?: unknown }).action
      : null;
  const action =
    rawAction === "transmit" ||
    rawAction === "reject" ||
    rawAction === "reopen" ||
    rawAction === "delete"
      ? rawAction
      : null;

  if (!action) {
    return NextResponse.json(
      { error: "Action attendue : transmit, reject, reopen ou delete." },
      { status: 400 },
    );
  }

  const outcome = await runContactMessageAdminAction({
    messageId: id,
    idToken: token,
    action,
  });

  if (!outcome.ok) {
    return NextResponse.json({ error: outcome.message }, { status: outcome.status });
  }

  return NextResponse.json({ ok: true });
}

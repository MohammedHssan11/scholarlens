/**
 * POST /api/scholarlens - the single entry point.
 * Owner: AlBaraa (AI & Backend Engineer).
 *
 * Baseline behaviour: validate the request, then return deterministic sample data.
 * Invalid input returns 400 and the AI provider is never called.
 */
import { NextResponse } from "next/server";
import { isValidRequest } from "@/lib/scholarlens/schema";
import { buildBaselineAnswer } from "@/lib/scholarlens/service";

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  if (!isValidRequest(body)) {
    return NextResponse.json(
      { error: "`question` (non-empty string) and `paper_ids` (string array) are required." },
      { status: 400 },
    );
  }

  const answer = buildBaselineAnswer(body.question, body.paper_ids);
  return NextResponse.json(answer);
}

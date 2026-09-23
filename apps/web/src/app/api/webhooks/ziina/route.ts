import { processZiinaWebhook } from "@amgclub/api/lib/ziina";
import { NextResponse } from "next/server";

// ---------------------------------------------------------------------------
// Ziina Webhook Handler
// Receives payment_intent.status.updated events from Ziina.
// All HMAC verification and DB logic is handled by processZiinaWebhook.
// Docs: https://docs.ziina.com/api-reference/webhook
// ---------------------------------------------------------------------------

export async function POST(request: Request) {
	const body = await request.text();
	const result = await processZiinaWebhook(body, request.headers);
	return NextResponse.json(result.body, { status: result.status });
}

import { createHmac, timingSafeEqual } from "node:crypto";
import { env } from "@amgclub/env/server";

// ---------------------------------------------------------------------------
// Ziina REST API client
// Base URL: https://api-v2.ziina.com/api
// Auth: Bearer token from ZIINA_API_TOKEN env var
// Docs: https://docs.ziina.com/api-reference/payment-intent
// ---------------------------------------------------------------------------

const ZIINA_BASE_URL = "https://api-v2.ziina.com/api";

function getAccessToken(): string {
	const token = env.ZIINA_API_TOKEN;
	if (!token) {
		throw new Error(
			"ZIINA_API_TOKEN is not set. Configure it in your environment variables.",
		);
	}
	return token;
}

async function ziinaFetch<T>(
	path: string,
	options: RequestInit = {},
): Promise<T> {
	const url = `${ZIINA_BASE_URL}${path}`;
	const token = getAccessToken();

	const res = await fetch(url, {
		...options,
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${token}`,
			...options.headers,
		},
	});

	const body = await res.json();

	if (!res.ok) {
		const message =
			typeof body === "object" && body !== null && "message" in body
				? String((body as { message: unknown }).message)
				: res.statusText;
		throw new Error(`Ziina API error (${res.status}): ${message}`);
	}

	return body as T;
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ZiinaPaymentIntentStatus =
	| "requires_payment_instrument"
	| "requires_user_action"
	| "pending"
	| "completed"
	| "failed"
	| "canceled";

export interface ZiinaPaymentIntent {
	id: string;
	account_id: string;
	amount: number;
	tip_amount: number;
	vat_amount: number;
	currency_code: string;
	created_at: string;
	status: ZiinaPaymentIntentStatus;
	operation_id: string;
	message: string | null;
	redirect_url: string;
	embedded_url: string | null;
	success_url: string | null;
	cancel_url: string | null;
	failure_url: string | null;
	latest_error: { message: string; code: string } | null;
	allow_tips: boolean;
}

export interface CreatePaymentIntentParams {
	/** Amount in base currency units (e.g. 1050 for 10.50 AED). */
	amount: number;
	/** 3-letter ISO-4217 currency code. */
	currency_code: string;
	/** Message shown on the hosted payment page. */
	message?: string;
	/** URL the user is redirected to after successful payment. Use {PAYMENT_INTENT_ID} placeholder. */
	success_url?: string;
	/** URL the user is redirected to if they cancel. Use {PAYMENT_INTENT_ID} placeholder. */
	cancel_url?: string;
	/** URL the user is redirected to after failed payment. */
	failure_url?: string;
	/** Pass true to create a test payment (no real charge). */
	test?: boolean;
	/** Unix timestamp in milliseconds — must be a future date. */
	expiry?: string;
	/** Whether to allow tips. Default false. */
	allow_tips?: boolean;
}

// ---------------------------------------------------------------------------
// Payment Intents
// ---------------------------------------------------------------------------

/**
 * Create a Ziina payment intent.
 *
 * @param params - Payment intent parameters
 * @returns The created payment intent with redirect_url for the user
 */
export async function createPaymentIntent(
	params: CreatePaymentIntentParams,
): Promise<ZiinaPaymentIntent> {
	return ziinaFetch<ZiinaPaymentIntent>("/payment_intent", {
		method: "POST",
		body: JSON.stringify(params),
	});
}

/**
 * Fetch an existing payment intent by ID.
 */
export async function getPaymentIntent(
	id: string,
): Promise<ZiinaPaymentIntent> {
	return ziinaFetch<ZiinaPaymentIntent>(`/payment_intent/${id}`);
}

// ---------------------------------------------------------------------------
// Webhooks
// ---------------------------------------------------------------------------

export interface ZiinaWebhookResponse {
	success: boolean;
	error?: string;
}

/**
 * Register or update the webhook endpoint with Ziina.
 * Call this from admin settings when configuring the webhook.
 */
export async function registerWebhook(
	url: string,
	secret?: string,
): Promise<ZiinaWebhookResponse> {
	return ziinaFetch<ZiinaWebhookResponse>("/webhook", {
		method: "POST",
		body: JSON.stringify({ url, secret }),
	});
}

/**
 * Delete the registered webhook.
 */
export async function deleteWebhook(): Promise<ZiinaWebhookResponse> {
	return ziinaFetch<ZiinaWebhookResponse>("/webhook", {
		method: "DELETE",
	});
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Convert AED (decimal) to fils (integer) for Ziina API. e.g. 10.50 → 1050 */
export function aedToFils(aed: number): number {
	return Math.round(aed * 100);
}

/** Convert fils (integer) back to AED (decimal). e.g. 1050 → 10.50 */
export function filsToAed(fils: number): number {
	return fils / 100;
}

// ---------------------------------------------------------------------------
// Webhook processing
// ---------------------------------------------------------------------------

export interface ZiinaWebhookEvent {
	event: string;
	data: {
		id: string;
		status: string;
	};
}

/**
 * Process an incoming Ziina webhook request.
 * Handles HMAC verification (if secret is configured) and updates
 * order or event attendee payment status based on the intent status.
 */
export async function processZiinaWebhook(
	body: string,
	requestHeaders: Headers,
): Promise<{ status: number; body: unknown }> {
	try {
		// Dynamically import DB to avoid circular deps at module load time
		const { getDb, orders, eventAttendees, paymentSettings } = await import(
			"@amgclub/db"
		);
		const { eq } = await import("drizzle-orm");

		// Read webhook secret for HMAC verification
		const db = getDb();
		const [settings] = await db
			.select()
			.from(paymentSettings)
			.where(eq(paymentSettings.id, 1))
			.limit(1);

		// Verify HMAC signature if secret is configured
		if (settings?.ziinaWebhookSecret) {
			const signature = requestHeaders.get("x-hmac-signature");
			if (!signature) {
				return { status: 401, body: { error: "Missing signature" } };
			}
			const expected = createHmac("sha256", settings.ziinaWebhookSecret)
				.update(body)
				.digest("hex");
			if (!timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
				return { status: 401, body: { error: "Invalid signature" } };
			}
		}

		const payload = JSON.parse(body) as ZiinaWebhookEvent;

		if (payload.event !== "payment_intent.status.updated") {
			return { status: 200, body: { success: true } };
		}

		const { id: paymentIntentId, status } = payload.data;
		if (!paymentIntentId || !status) {
			return {
				status: 400,
				body: { error: "Missing payment_intent_id or status" },
			};
		}

		// Map Ziina status to our payment statuses
		let paymentStatus: "paid" | "failed";
		switch (status) {
			case "completed":
				paymentStatus = "paid";
				break;
			case "failed":
			case "canceled":
				paymentStatus = "failed";
				break;
			default:
				return { status: 200, body: { success: true } };
		}

		// Update order if linked to this payment intent
		const [order] = await db
			.select({ id: orders.id })
			.from(orders)
			.where(eq(orders.paymentIntentId, paymentIntentId))
			.limit(1);

		if (order) {
			await db
				.update(orders)
				.set({
					paymentStatus: paymentStatus as
						| "pending"
						| "paid"
						| "failed"
						| "refunded",
				})
				.where(eq(orders.id, order.id));
			return { status: 200, body: { success: true } };
		}

		// Update event attendee if linked to this payment intent
		const [attendee] = await db
			.select({ id: eventAttendees.id })
			.from(eventAttendees)
			.where(eq(eventAttendees.paymentIntentId, paymentIntentId))
			.limit(1);

		if (attendee) {
			await db
				.update(eventAttendees)
				.set({ paymentStatus })
				.where(eq(eventAttendees.id, attendee.id));
			return { status: 200, body: { success: true } };
		}

		return { status: 200, body: { success: true } };
	} catch (error) {
		console.error("Ziina webhook error:", error);
		return { status: 500, body: { error: "Internal server error" } };
	}
}

import { getDb, membershipSettings, paymentSettings } from "@amgclub/db";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { adminProcedure, router } from "../index";
import { registerWebhook } from "../lib/ziina";

// ---------------------------------------------------------------------------
// Membership settings
// ---------------------------------------------------------------------------

export const settingsDefaults = {
	monthlyPrice: 0,
	yearlyPrice: 0,
	expiringSoonDays: 30,
	currency: "AED",
} as const;

export type MembershipSettingsDTO = {
	monthlyPrice: number;
	yearlyPrice: number;
	expiringSoonDays: number;
	currency: string;
	updatedAt: string | null;
};

async function readSettings(): Promise<MembershipSettingsDTO> {
	const db = getDb();
	const [row] = await db
		.select()
		.from(membershipSettings)
		.where(eq(membershipSettings.id, 1))
		.limit(1);
	if (!row) {
		return { ...settingsDefaults, updatedAt: null };
	}
	return {
		monthlyPrice: row.monthlyPrice,
		yearlyPrice: row.yearlyPrice,
		expiringSoonDays: row.expiringSoonDays,
		currency: row.currency,
		updatedAt: row.updatedAt.toISOString(),
	};
}

const updateSettingsSchema = z.object({
	monthlyPrice: z.number().min(0, "Price must be zero or more").max(1_000_000),
	yearlyPrice: z.number().min(0, "Price must be zero or more").max(1_000_000),
	expiringSoonDays: z.number().int().min(1).max(365),
});

// ---------------------------------------------------------------------------
// Payment settings (Ziina)
// ---------------------------------------------------------------------------

export type PaymentSettingsDTO = {
	ziinaMode: "test" | "live";
	ziinaWebhookSecret: string | null;
	ziinaWebhookUrl: string | null;
	updatedAt: string | null;
};

async function readPaymentSettings(): Promise<PaymentSettingsDTO> {
	try {
		const db = getDb();
		const [row] = await db
			.select()
			.from(paymentSettings)
			.where(eq(paymentSettings.id, 1))
			.limit(1);
		if (!row) {
			return {
				ziinaMode: "test",
				ziinaWebhookSecret: null,
				ziinaWebhookUrl: null,
				updatedAt: null,
			};
		}
		return {
			ziinaMode: row.ziinaMode as "test" | "live",
			ziinaWebhookSecret: row.ziinaWebhookSecret,
			ziinaWebhookUrl: row.ziinaWebhookUrl,
			updatedAt: row.updatedAt.toISOString(),
		};
	} catch {
		// Table may not exist yet (migration not run)
		return {
			ziinaMode: "test",
			ziinaWebhookSecret: null,
			ziinaWebhookUrl: null,
			updatedAt: null,
		};
	}
}

const updatePaymentSettingsSchema = z.object({
	ziinaMode: z.enum(["test", "live"]),
	ziinaWebhookSecret: z.string().max(500).nullish(),
});

// ---------------------------------------------------------------------------
// Router
// ---------------------------------------------------------------------------

export const settingsRouter = router({
	get: adminProcedure.query(async () => {
		return readSettings();
	}),

	update: adminProcedure
		.input(updateSettingsSchema)
		.mutation(async ({ input }) => {
			const db = getDb();
			await db
				.insert(membershipSettings)
				.values({ id: 1, ...input })
				.onConflictDoUpdate({
					target: membershipSettings.id,
					set: input,
				});
			return readSettings();
		}),

	// ── Payment settings (Ziina) ───────────────────────────────────────

	getPayment: adminProcedure.query(async () => {
		return readPaymentSettings();
	}),

	updatePayment: adminProcedure
		.input(updatePaymentSettingsSchema)
		.mutation(async ({ input }) => {
			const db = getDb();
			try {
				await db
					.insert(paymentSettings)
					.values({ id: 1, ...input })
					.onConflictDoUpdate({
						target: paymentSettings.id,
						set: input,
					});
			} catch {
				throw new TRPCError({
					code: "PRECONDITION_FAILED",
					message:
						"Payment settings table not found. Run the database migration first.",
				});
			}
			return readPaymentSettings();
		}),

	registerWebhook: adminProcedure
		.input(z.object({ url: z.string().url() }))
		.mutation(async ({ input }) => {
			const settings = await readPaymentSettings();
			const secret = settings.ziinaWebhookSecret ?? undefined;
			const result = await registerWebhook(input.url, secret);

			// Persist the webhook URL in settings
			if (result.success) {
				const db = getDb();
				await db
					.insert(paymentSettings)
					.values({ id: 1, ziinaWebhookUrl: input.url })
					.onConflictDoUpdate({
						target: paymentSettings.id,
						set: { ziinaWebhookUrl: input.url },
					});
			}

			return result;
		}),
});

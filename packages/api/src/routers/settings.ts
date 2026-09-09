import { getDb, membershipSettings } from "@amgclub/db";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { adminProcedure, router } from "../index";

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
});

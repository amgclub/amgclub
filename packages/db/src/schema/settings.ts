import { sql } from "drizzle-orm";
import {
	check,
	integer,
	numeric,
	pgTable,
	text,
	timestamp,
} from "drizzle-orm/pg-core";

/**
 * Singleton row (id = 1) with club-wide membership configuration.
 * Prices are in UAE Dirhams (AED) per billing period.
 */
export const membershipSettings = pgTable(
	"membership_settings",
	{
		id: integer("id").primaryKey().default(1),
		monthlyPrice: numeric("monthly_price", {
			precision: 10,
			scale: 2,
			mode: "number",
		})
			.notNull()
			.default(0),
		yearlyPrice: numeric("yearly_price", {
			precision: 10,
			scale: 2,
			mode: "number",
		})
			.notNull()
			.default(0),
		/** Memberships active with an end date within this many days are "expiring soon". */
		expiringSoonDays: integer("expiring_soon_days").notNull().default(30),
		currency: text("currency").notNull().default("AED"),
		updatedAt: timestamp("updated_at", { withTimezone: true })
			.defaultNow()
			.notNull()
			.$onUpdate(() => new Date()),
	},
	(table) => [
		check("membership_settings_singleton_check", sql`${table.id} = 1`),
	],
);

// ---------------------------------------------------------------------------
// Payment settings (Ziina)
// ---------------------------------------------------------------------------

export const paymentSettings = pgTable(
	"payment_settings",
	{
		id: integer("id").primaryKey().default(1),
		/** "test" or "live" — controls whether payment intents use Ziina test mode. */
		ziinaMode: text("ziina_mode").notNull().default("test"),
		/** Shared secret for verifying Ziina webhook HMAC signatures. */
		ziinaWebhookSecret: text("ziina_webhook_secret"),
		/** The registered webhook URL (stored for display in admin). */
		ziinaWebhookUrl: text("ziina_webhook_url"),
		updatedAt: timestamp("updated_at", { withTimezone: true })
			.defaultNow()
			.notNull()
			.$onUpdate(() => new Date()),
	},
	(table) => [
		check("payment_settings_singleton_check", sql`${table.id} = 1`),
		check(
			"payment_settings_ziina_mode_check",
			sql`${table.ziinaMode} in ('test', 'live')`,
		),
	],
);

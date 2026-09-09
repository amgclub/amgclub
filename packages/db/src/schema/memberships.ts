import { sql } from "drizzle-orm";
import {
	check,
	date,
	index,
	numeric,
	pgEnum,
	pgTable,
	text,
	timestamp,
	uuid,
} from "drizzle-orm/pg-core";

export const membershipStatusEnum = pgEnum("membership_status", [
	"in_review",
	"active",
	"paused",
	"canceled",
]);

export const membershipPlanEnum = pgEnum("membership_plan", [
	"monthly",
	"yearly",
]);

export const membershipSourceEnum = pgEnum("membership_source", [
	"website",
	"manual",
]);

/** AED price stored as decimal(10,2), read/written as a JS number. */
function aedPrice(name: string) {
	return numeric(name, { precision: 10, scale: 2, mode: "number" });
}

/**
 * A club membership application/record.
 * Price is per billing period in UAE Dirhams (AED).
 */
export const memberships = pgTable(
	"memberships",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		memberName: text("member_name").notNull(),
		email: text("email").notNull(),
		phone: text("phone").notNull(),
		plan: membershipPlanEnum("plan").notNull().default("monthly"),
		status: membershipStatusEnum("status").notNull().default("in_review"),
		price: aedPrice("price").notNull().default(0),
		startDate: date("start_date").notNull(),
		endDate: date("end_date").notNull(),
		source: membershipSourceEnum("source").notNull().default("manual"),
		notes: text("notes"),
		createdAt: timestamp("created_at", { withTimezone: true })
			.defaultNow()
			.notNull(),
		updatedAt: timestamp("updated_at", { withTimezone: true })
			.defaultNow()
			.notNull()
			.$onUpdate(() => new Date()),
	},
	(table) => [
		index("memberships_status_idx").on(table.status),
		index("memberships_end_date_idx").on(table.endDate),
		index("memberships_created_at_idx").on(table.createdAt),
		index("memberships_email_idx").on(table.email),
		check(
			"memberships_date_range_check",
			sql`${table.endDate} >= ${table.startDate}`,
		),
		check("memberships_price_non_negative_check", sql`${table.price} >= 0`),
	],
);

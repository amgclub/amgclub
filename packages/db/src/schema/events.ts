import { sql } from "drizzle-orm";
import {
	check,
	date,
	index,
	integer,
	numeric,
	pgEnum,
	pgTable,
	text,
	time,
	timestamp,
	uuid,
} from "drizzle-orm/pg-core";

export const eventStatusEnum = pgEnum("event_status", [
	"active",
	"paused",
	"canceled",
]);

/** AED price stored as decimal(10,2), read/written as a JS number. 0 = free. */
function aedPrice(name: string) {
	return numeric(name, { precision: 10, scale: 2, mode: "number" });
}

/** A club event (meetup, drive, track day, …). */
export const events = pgTable(
	"events",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		title: text("title").notNull(),
		description: text("description"),
		imageUrl: text("image_url"),
		location: text("location").notNull(),
		/** Google Maps share link for the venue. */
		mapUrl: text("map_url"),
		eventDate: date("event_date").notNull(),
		startTime: time("start_time").notNull(),
		endTime: time("end_time"),
		status: eventStatusEnum("status").notNull().default("active"),
		price: aedPrice("price").notNull().default(0),
		totalAttendees: integer("total_attendees").notNull().default(0),
		createdAt: timestamp("created_at", { withTimezone: true })
			.defaultNow()
			.notNull(),
		updatedAt: timestamp("updated_at", { withTimezone: true })
			.defaultNow()
			.notNull()
			.$onUpdate(() => new Date()),
	},
	(table) => [
		index("events_status_idx").on(table.status),
		index("events_event_date_idx").on(table.eventDate),
		check("events_price_non_negative_check", sql`${table.price} >= 0`),
		check(
			"events_total_attendees_non_negative_check",
			sql`${table.totalAttendees} >= 0`,
		),
	],
);

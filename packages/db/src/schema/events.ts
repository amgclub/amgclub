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
	uniqueIndex,
	uuid,
} from "drizzle-orm/pg-core";

export const eventStatusEnum = pgEnum("event_status", [
	"active",
	"paused",
	"canceled",
	"completed",
]);

export const eventAttendeeStatusEnum = pgEnum("event_attendee_status", [
	"attending",
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

/** Registered attendees for a club event. */
export const eventAttendees = pgTable(
	"event_attendees",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		eventId: uuid("event_id")
			.notNull()
			.references(() => events.id, { onDelete: "cascade" }),
		userId: text("user_id"),
		name: text("name").notNull(),
		email: text("email").notNull(),
		phone: text("phone").notNull(),
		status: eventAttendeeStatusEnum("status").notNull().default("attending"),
		/** Payment status for paid events. null/empty = free event or not yet paid. */
		paymentStatus: text("payment_status").default("pending"),
		/** Ziina payment intent ID — links this registration to its payment. */
		paymentIntentId: text("payment_intent_id"),
		createdAt: timestamp("created_at", { withTimezone: true })
			.defaultNow()
			.notNull(),
		updatedAt: timestamp("updated_at", { withTimezone: true })
			.defaultNow()
			.notNull()
			.$onUpdate(() => new Date()),
	},
	(table) => [
		index("event_attendees_event_id_idx").on(table.eventId),
		index("event_attendees_email_idx").on(table.email),
		index("event_attendees_status_idx").on(table.status),
		uniqueIndex("event_attendees_event_id_email_idx").on(
			table.eventId,
			table.email,
		),
	],
);

export type EventAttendee = typeof eventAttendees.$inferSelect;
export type NewEventAttendee = typeof eventAttendees.$inferInsert;
export type EventAttendeeStatus =
	(typeof eventAttendeeStatusEnum.enumValues)[number];

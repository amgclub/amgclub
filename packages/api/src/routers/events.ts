import { events, getDb } from "@amgclub/db";
import { and, asc, desc, eq, ilike, or, type SQL, sql } from "drizzle-orm";
import { z } from "zod";

import { adminProcedure, router } from "../index";

export const eventStatusSchema = z.enum(["active", "paused", "canceled"]);

const dateString = z
	.string()
	.regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date, expected YYYY-MM-DD");

const timeString = z
	.string()
	.regex(/^\d{2}:\d{2}(:\d{2})?$/, "Invalid time, expected HH:MM");

const eventFields = {
	title: z.string().min(1, "Title is required").max(160),
	description: z.string().max(4000).nullish(),
	imageUrl: z.url("Enter a valid URL").nullish(),
	location: z.string().min(1, "Location is required").max(240),
	mapUrl: z.url("Enter a valid Google Maps link").nullish(),
	eventDate: dateString,
	startTime: timeString,
	endTime: timeString.nullish(),
	status: eventStatusSchema,
	/** 0 = free event */
	price: z.number().min(0, "Price must be zero or more").max(1_000_000),
	totalAttendees: z.number().int().min(0).max(1_000_000).default(0),
};

export const createEventSchema = z.object(eventFields);

export const updateEventSchema = z.object(eventFields).partial();

const listEventsSchema = z.object({
	status: eventStatusSchema.optional(),
	search: z.string().trim().max(160).optional(),
	page: z.number().int().min(1).default(1),
	pageSize: z.number().int().min(1).max(100).default(50),
});

export type EventDTO = {
	id: string;
	title: string;
	description: string | null;
	imageUrl: string | null;
	location: string;
	mapUrl: string | null;
	eventDate: string;
	startTime: string;
	endTime: string | null;
	status: "active" | "paused" | "canceled";
	price: number;
	totalAttendees: number;
	createdAt: string;
	updatedAt: string;
};

function toEventDTO(row: typeof events.$inferSelect): EventDTO {
	return {
		id: row.id,
		title: row.title,
		description: row.description,
		imageUrl: row.imageUrl,
		location: row.location,
		mapUrl: row.mapUrl,
		eventDate: row.eventDate,
		startTime: row.startTime,
		endTime: row.endTime,
		status: row.status,
		price: row.price,
		totalAttendees: row.totalAttendees,
		createdAt: row.createdAt.toISOString(),
		updatedAt: row.updatedAt.toISOString(),
	};
}

export { toEventDTO };

export const eventsRouter = router({
	list: adminProcedure.input(listEventsSchema).query(async ({ input }) => {
		const db = getDb();
		const conditions: SQL[] = [];
		if (input.status) {
			conditions.push(eq(events.status, input.status));
		}
		if (input.search) {
			const pattern = `%${input.search}%`;
			const searchFilter = or(
				ilike(events.title, pattern),
				ilike(events.location, pattern),
			);
			if (searchFilter) {
				conditions.push(searchFilter);
			}
		}
		const where = conditions.length > 0 ? and(...conditions) : undefined;

		const [rows, totals] = await Promise.all([
			db
				.select()
				.from(events)
				.where(where)
				// Upcoming events first (soonest date at the top), past events after.
				.orderBy(
					asc(sql`${events.eventDate} >= current_date`),
					desc(events.eventDate),
					asc(events.startTime),
				)
				.limit(input.pageSize)
				.offset((input.page - 1) * input.pageSize),
			db
				.select({ count: sql<number>`count(*)::int` })
				.from(events)
				.where(where),
		]);

		return {
			items: rows.map(toEventDTO),
			total: totals[0]?.count ?? 0,
			page: input.page,
			pageSize: input.pageSize,
		};
	}),

	create: adminProcedure
		.input(createEventSchema)
		.mutation(async ({ input }) => {
			const db = getDb();
			const [row] = await db.insert(events).values(input).returning();
			if (!row) {
				throw new Error("Failed to create event");
			}
			return toEventDTO(row);
		}),

	update: adminProcedure
		.input(
			z.object({
				id: z.uuid(),
				data: updateEventSchema,
			}),
		)
		.mutation(async ({ input }) => {
			const db = getDb();
			const [row] = await db
				.update(events)
				.set(input.data)
				.where(eq(events.id, input.id))
				.returning();
			if (!row) {
				throw new Error("Event not found");
			}
			return toEventDTO(row);
		}),

	updateStatus: adminProcedure
		.input(
			z.object({
				id: z.uuid(),
				status: eventStatusSchema,
			}),
		)
		.mutation(async ({ input }) => {
			const db = getDb();
			const [row] = await db
				.update(events)
				.set({ status: input.status })
				.where(eq(events.id, input.id))
				.returning();
			if (!row) {
				throw new Error("Event not found");
			}
			return toEventDTO(row);
		}),

	delete: adminProcedure.input(z.uuid()).mutation(async ({ input }) => {
		const db = getDb();
		const [row] = await db
			.delete(events)
			.where(eq(events.id, input))
			.returning({ id: events.id });
		if (!row) {
			throw new Error("Event not found");
		}
		return row;
	}),
});

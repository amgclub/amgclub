import { eventAttendees, events, getDb } from "@amgclub/db";
import { TRPCError } from "@trpc/server";
import { and, asc, desc, eq, ilike, or, type SQL, sql } from "drizzle-orm";
import { z } from "zod";
import { adminProcedure, router } from "../index";
import {
	rateLimitedPublicProcedure,
	registerRateLimitedProcedure,
} from "../rate-limit";

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
};

export const createEventSchema = z.object(eventFields);

export const updateEventSchema = z.object(eventFields).partial();

export const registerAttendeeSchema = z.object({
	eventId: z.uuid(),
	name: z.string().trim().min(1, "Name is required").max(120),
	email: z.string().trim().email("Invalid email address").toLowerCase(),
	phone: z.string().trim().min(1, "Phone number is required").max(30),
});

export const listAttendeesSchema = z.object({
	eventId: z.uuid(),
	status: z.enum(["all", "attending", "canceled"]).default("all"),
	search: z.string().trim().optional(),
});

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

export type EventAttendeeDTO = {
	id: string;
	eventId: string;
	userId: string | null;
	name: string;
	email: string;
	phone: string;
	status: "attending" | "canceled";
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

export function toAttendeeDTO(
	row: typeof eventAttendees.$inferSelect,
): EventAttendeeDTO {
	return {
		id: row.id,
		eventId: row.eventId,
		userId: row.userId,
		name: row.name,
		email: row.email,
		phone: row.phone,
		status: row.status,
		createdAt: row.createdAt.toISOString(),
		updatedAt: row.updatedAt.toISOString(),
	};
}

export type RegisterAttendeeInput = z.infer<typeof registerAttendeeSchema> & {
	userId?: string | null;
};

/**
 * Shared registration logic used by both tRPC and REST endpoints.
 * Validates event existence/status, manages attendee records,
 * and updates dynamic total attendees count.
 */
export async function registerEventAttendee(
	input: RegisterAttendeeInput,
	db = getDb(),
) {
	return await db.transaction(async (tx) => {
		const [event] = await tx
			.select({ id: events.id, status: events.status })
			.from(events)
			.where(eq(events.id, input.eventId));

		if (!event) {
			throw new TRPCError({
				code: "NOT_FOUND",
				message: "Event not found",
			});
		}

		if (event.status !== "active") {
			throw new TRPCError({
				code: "BAD_REQUEST",
				message: "Event is not open for registration",
			});
		}

		const [existing] = await tx
			.select()
			.from(eventAttendees)
			.where(
				and(
					eq(eventAttendees.eventId, input.eventId),
					eq(eventAttendees.email, input.email),
				),
			);

		if (existing) {
			if (existing.status === "attending") {
				throw new TRPCError({
					code: "CONFLICT",
					message: "You are already registered for this event.",
				});
			}

			// Reactivate canceled attendee
			await tx
				.update(eventAttendees)
				.set({
					status: "attending",
					name: input.name,
					phone: input.phone,
					userId: input.userId ?? existing.userId,
					updatedAt: new Date(),
				})
				.where(eq(eventAttendees.id, existing.id));
		} else {
			await tx.insert(eventAttendees).values({
				eventId: input.eventId,
				userId: input.userId ?? null,
				name: input.name,
				email: input.email,
				phone: input.phone,
				status: "attending",
			});
		}

		const [attendeeCount] = await tx
			.select({ count: sql<number>`count(*)::int` })
			.from(eventAttendees)
			.where(
				and(
					eq(eventAttendees.eventId, input.eventId),
					eq(eventAttendees.status, "attending"),
				),
			);

		const newCount = attendeeCount?.count ?? 0;

		await tx
			.update(events)
			.set({ totalAttendees: newCount })
			.where(eq(events.id, input.eventId));

		return {
			success: true as const,
			message: "Registration confirmed",
			totalAttendees: newCount,
		};
	});
}

export const eventsRouter = router({
	publicList: rateLimitedPublicProcedure.query(async () => {
		const db = getDb();
		const rows = await db
			.select()
			.from(events)
			.where(
				and(
					eq(events.status, "active"),
					sql`${events.eventDate} >= current_date`,
				),
			)
			.orderBy(asc(events.eventDate), asc(events.startTime));

		return rows.map(toEventDTO);
	}),

	register: registerRateLimitedProcedure
		.input(registerAttendeeSchema)
		.mutation(async ({ ctx, input }) => {
			return await registerEventAttendee({
				...input,
				userId: ctx.session?.user?.id ?? null,
			});
		}),

	listAttendees: adminProcedure
		.input(listAttendeesSchema)
		.query(async ({ input }) => {
			const db = getDb();
			const conditions: SQL[] = [eq(eventAttendees.eventId, input.eventId)];

			if (input.status !== "all") {
				conditions.push(eq(eventAttendees.status, input.status));
			}

			if (input.search) {
				const pattern = `%${input.search}%`;
				const searchFilter = or(
					ilike(eventAttendees.name, pattern),
					ilike(eventAttendees.email, pattern),
					ilike(eventAttendees.phone, pattern),
				);
				if (searchFilter) {
					conditions.push(searchFilter);
				}
			}

			const where = and(...conditions);

			const [rows, statusCounts] = await Promise.all([
				db
					.select()
					.from(eventAttendees)
					.where(where)
					.orderBy(desc(eventAttendees.createdAt)),
				db
					.select({
						status: eventAttendees.status,
						count: sql<number>`count(*)::int`,
					})
					.from(eventAttendees)
					.where(eq(eventAttendees.eventId, input.eventId))
					.groupBy(eventAttendees.status),
			]);

			let attending = 0;
			let canceled = 0;
			for (const sc of statusCounts) {
				if (sc.status === "attending") {
					attending = sc.count;
				} else if (sc.status === "canceled") {
					canceled = sc.count;
				}
			}
			const total = attending + canceled;

			const attendeeDtos = rows.map(toAttendeeDTO);

			return {
				items: attendeeDtos,
				attendees: attendeeDtos,
				counts: {
					attending,
					canceled,
					total,
				},
				attending,
				canceled,
				total,
			};
		}),

	updateAttendeeStatus: adminProcedure
		.input(
			z.object({
				attendeeId: z.uuid(),
				status: z.enum(["attending", "canceled"]),
			}),
		)
		.mutation(async ({ input }) => {
			const db = getDb();
			return await db.transaction(async (tx) => {
				const [attendee] = await tx
					.update(eventAttendees)
					.set({
						status: input.status,
						updatedAt: new Date(),
					})
					.where(eq(eventAttendees.id, input.attendeeId))
					.returning();

				if (!attendee) {
					throw new TRPCError({
						code: "NOT_FOUND",
						message: "Attendee not found",
					});
				}

				const [countResult] = await tx
					.select({ count: sql<number>`count(*)::int` })
					.from(eventAttendees)
					.where(
						and(
							eq(eventAttendees.eventId, attendee.eventId),
							eq(eventAttendees.status, "attending"),
						),
					);

				const newCount = countResult?.count ?? 0;

				await tx
					.update(events)
					.set({ totalAttendees: newCount })
					.where(eq(events.id, attendee.eventId));

				return {
					success: true as const,
					attendee: toAttendeeDTO(attendee),
					totalAttendees: newCount,
				};
			});
		}),

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
				.select({
					id: events.id,
					title: events.title,
					description: events.description,
					imageUrl: events.imageUrl,
					location: events.location,
					mapUrl: events.mapUrl,
					eventDate: events.eventDate,
					startTime: events.startTime,
					endTime: events.endTime,
					status: events.status,
					price: events.price,
					totalAttendees: events.totalAttendees,
					createdAt: events.createdAt,
					updatedAt: events.updatedAt,
				})
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

	getById: adminProcedure.input(z.uuid()).query(async ({ input }) => {
		const db = getDb();
		const [row] = await db
			.select()
			.from(events)
			.where(eq(events.id, input))
			.limit(1);
		if (!row) {
			throw new TRPCError({
				code: "NOT_FOUND",
				message: "Event not found",
			});
		}
		return toEventDTO(row);
	}),

	create: adminProcedure
		.input(createEventSchema)
		.mutation(async ({ input }) => {
			const db = getDb();
			const [row] = await db
				.insert(events)
				.values({
					...input,
					totalAttendees: 0,
				})
				.returning();
			if (!row) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Failed to create event",
				});
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
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Event not found",
				});
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
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Event not found",
				});
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
			throw new TRPCError({
				code: "NOT_FOUND",
				message: "Event not found",
			});
		}
		return row;
	}),
});

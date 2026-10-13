import { getDb, memberships } from "@amgclub/db";
import { TRPCError } from "@trpc/server";
import { and, desc, eq, ilike, or, type SQL, sql } from "drizzle-orm";
import { z } from "zod";

import { adminProcedure, publicProcedure, router } from "../index";
import { membershipApplyRateLimitedProcedure } from "../rate-limit";

/** Single monthly membership fee in AED. One plan, one price, set by the club. */
export const MEMBERSHIP_PRICE_AED = 350;

export const membershipStatusSchema = z.enum([
	"in_review",
	"active",
	"paused",
	"canceled",
]);

export const membershipPlanSchema = z.enum(["monthly", "yearly"]);

const dateString = z
	.string()
	.regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date, expected YYYY-MM-DD");

const memberFields = {
	memberName: z.string().min(1, "Name is required").max(120),
	email: z.email("Enter a valid email address"),
	phone: z.string().min(5, "Phone is required").max(32),
	plan: membershipPlanSchema,
	status: membershipStatusSchema,
	price: z.number().min(0, "Price must be zero or more").max(1_000_000),
	startDate: dateString,
	endDate: dateString,
	carModel: z
		.string()
		.trim()
		.max(120)
		// A cleared admin field clears the column instead of storing an empty string.
		.transform((value) => value || null)
		.nullable()
		.optional(),
	notes: z.string().max(2000).nullish(),
};

export const createMemberSchema = z
	.object(memberFields)
	.refine((value) => value.endDate >= value.startDate, {
		message: "End date must be on or after the start date",
		path: ["endDate"],
	});

export const updateMemberSchema = z
	.object(memberFields)
	.partial()
	.refine(
		(value) =>
			!value.startDate || !value.endDate || value.endDate >= value.startDate,
		{
			message: "End date must be on or after the start date",
			path: ["endDate"],
		},
	);

const listMembersSchema = z.object({
	status: membershipStatusSchema.optional(),
	search: z.string().trim().max(120).optional(),
	page: z.number().int().min(1).default(1),
	pageSize: z.number().int().min(1).max(100).default(20),
});

/** Public website join-request form. No plan/price/status: the club decides those. */
const membershipApplicationSchema = z.object({
	memberName: z.string().trim().min(1, "Name is required").max(120),
	email: z.email("Enter a valid email address").max(254),
	phone: z.string().trim().min(5, "Phone is required").max(32),
	carModel: z.string().trim().min(1, "Car model is required").max(120),
	// An empty textarea posts "" rather than null; collapsing it here keeps
	// "no notes" stored as NULL so the admin list does not fill with blanks.
	notes: z
		.string()
		.trim()
		.max(2000, "Notes are limited to 2000 characters")
		.nullish()
		.transform((value) => value || null),
});

/** Today as YYYY-MM-DD, the format the `date` columns store. */
function todayISODate(): string {
	return new Date().toISOString().slice(0, 10);
}

/**
 * One month after `iso`, clamped to the last valid day of the target month so a
 * 31 Jan start rolls to 28 Feb (29 in a leap year) instead of overflowing into
 * March. Date.UTC normalises the month 12 overflow into January of the next year
 * on its own, so December crosses the boundary without a special case.
 */
function addOneMonth(iso: string): string {
	const start = new Date(`${iso}T00:00:00Z`);
	const year = start.getUTCFullYear();
	const month = start.getUTCMonth();
	const lastDayOfTargetMonth = new Date(
		Date.UTC(year, month + 2, 0),
	).getUTCDate();
	return new Date(
		Date.UTC(
			year,
			month + 1,
			Math.min(start.getUTCDate(), lastDayOfTargetMonth),
		),
	)
		.toISOString()
		.slice(0, 10);
}

export type MemberDTO = {
	id: string;
	memberName: string;
	email: string;
	phone: string;
	plan: "monthly" | "yearly";
	status: "in_review" | "active" | "paused" | "canceled";
	price: number;
	startDate: string;
	endDate: string;
	source: "website" | "manual";
	carModel: string | null;
	notes: string | null;
	createdAt: string;
	updatedAt: string;
};

function toMemberDTO(row: typeof memberships.$inferSelect): MemberDTO {
	return {
		id: row.id,
		memberName: row.memberName,
		email: row.email,
		phone: row.phone,
		plan: row.plan,
		status: row.status,
		price: row.price,
		startDate: row.startDate,
		endDate: row.endDate,
		source: row.source,
		carModel: row.carModel,
		notes: row.notes,
		createdAt: row.createdAt.toISOString(),
		updatedAt: row.updatedAt.toISOString(),
	};
}

export { toMemberDTO };

export const membersRouter = router({
	pricing: publicProcedure.query(() => {
		return {
			price: MEMBERSHIP_PRICE_AED,
			currency: "AED",
		} as const;
	}),

	// tRPC reserves `apply` as a procedure name (it would shadow
	// Function.prototype.apply on the procedure), so this is `applyMembership`.
	applyMembership: membershipApplyRateLimitedProcedure
		.input(membershipApplicationSchema)
		.mutation(async ({ input }) => {
			const db = getDb();
			const startDate = todayISODate();
			const endDate = addOneMonth(startDate);

			// The dates are derived, not submitted, so this is the only guard on the
			// memberships_date_range_check constraint behind them.
			if (endDate < startDate) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "Could not work out the membership period. Try again later.",
				});
			}

			// No unique constraint on email on purpose: two members of one family
			// share an address, so a repeat application is a valid second record.
			const [row] = await db
				.insert(memberships)
				.values({
					memberName: input.memberName,
					email: input.email,
					phone: input.phone,
					carModel: input.carModel,
					notes: input.notes,
					source: "website",
					status: "in_review",
					plan: "monthly",
					price: MEMBERSHIP_PRICE_AED,
					startDate,
					endDate,
				})
				.returning({
					id: memberships.id,
					memberName: memberships.memberName,
					email: memberships.email,
				});

			if (!row) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "Could not submit your application. Try again later.",
				});
			}

			return row;
		}),

	list: adminProcedure.input(listMembersSchema).query(async ({ input }) => {
		const db = getDb();
		const conditions: SQL[] = [];
		if (input.status) {
			conditions.push(eq(memberships.status, input.status));
		}
		if (input.search) {
			const pattern = `%${input.search}%`;
			const searchFilter = or(
				ilike(memberships.memberName, pattern),
				ilike(memberships.email, pattern),
				ilike(memberships.phone, pattern),
				ilike(memberships.carModel, pattern),
			);
			if (searchFilter) {
				conditions.push(searchFilter);
			}
		}
		const where = conditions.length > 0 ? and(...conditions) : undefined;

		const [rows, totals] = await Promise.all([
			db
				.select({
					id: memberships.id,
					memberName: memberships.memberName,
					email: memberships.email,
					phone: memberships.phone,
					plan: memberships.plan,
					status: memberships.status,
					price: memberships.price,
					startDate: memberships.startDate,
					endDate: memberships.endDate,
					source: memberships.source,
					carModel: memberships.carModel,
					notes: memberships.notes,
					createdAt: memberships.createdAt,
					updatedAt: memberships.updatedAt,
				})
				.from(memberships)
				.where(where)
				.orderBy(desc(memberships.createdAt))
				.limit(input.pageSize)
				.offset((input.page - 1) * input.pageSize),
			db
				.select({ count: sql<number>`count(*)::int` })
				.from(memberships)
				.where(where),
		]);

		return {
			items: rows.map(toMemberDTO),
			total: totals[0]?.count ?? 0,
			page: input.page,
			pageSize: input.pageSize,
		};
	}),

	create: adminProcedure
		.input(createMemberSchema)
		.mutation(async ({ input }) => {
			const db = getDb();
			const [row] = await db
				.insert(memberships)
				.values({ ...input, source: "manual" })
				.returning();
			if (!row) {
				throw new Error("Failed to create member");
			}
			return toMemberDTO(row);
		}),

	update: adminProcedure
		.input(
			z.object({
				id: z.uuid(),
				data: updateMemberSchema,
			}),
		)
		.mutation(async ({ input }) => {
			const db = getDb();
			const [row] = await db
				.update(memberships)
				.set(input.data)
				.where(eq(memberships.id, input.id))
				.returning();
			if (!row) {
				throw new Error("Member not found");
			}
			return toMemberDTO(row);
		}),

	updateStatus: adminProcedure
		.input(
			z.object({
				id: z.uuid(),
				status: membershipStatusSchema,
			}),
		)
		.mutation(async ({ input }) => {
			const db = getDb();
			const [row] = await db
				.update(memberships)
				.set({ status: input.status })
				.where(eq(memberships.id, input.id))
				.returning();
			if (!row) {
				throw new Error("Member not found");
			}
			return toMemberDTO(row);
		}),

	delete: adminProcedure.input(z.uuid()).mutation(async ({ input }) => {
		const db = getDb();
		const [row] = await db
			.delete(memberships)
			.where(eq(memberships.id, input))
			.returning({ id: memberships.id });
		if (!row) {
			throw new Error("Member not found");
		}
		return row;
	}),
});

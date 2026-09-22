import { getDb, memberships } from "@amgclub/db";
import { and, desc, eq, ilike, or, type SQL, sql } from "drizzle-orm";
import { z } from "zod";

import { adminProcedure, router } from "../index";

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
		notes: row.notes,
		createdAt: row.createdAt.toISOString(),
		updatedAt: row.updatedAt.toISOString(),
	};
}

export { toMemberDTO };

export const membersRouter = router({
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

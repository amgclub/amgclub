import { customers, getDb } from "@amgclub/db";
import { TRPCError } from "@trpc/server";
import { and, desc, eq, ilike, or, type SQL, sql } from "drizzle-orm";
import { z } from "zod";
import { adminProcedure, router } from "../index";

// ---------------------------------------------------------------------------
// Zod schemas
// ---------------------------------------------------------------------------

const customerInputSchema = z.object({
	name: z.string().min(1, "Name is required").max(200),
	email: z.string().email("Invalid email address").toLowerCase().max(200),
	phone: z.string().max(30).nullish(),
	userId: z.string().max(200).nullish(),
});

const updateCustomerSchema = customerInputSchema.partial();

const listCustomersSchema = z.object({
	search: z.string().trim().max(200).optional(),
	page: z.number().int().min(1).default(1),
	pageSize: z.number().int().min(1).max(100).default(50),
});

// ---------------------------------------------------------------------------
// DTOs
// ---------------------------------------------------------------------------

export type CustomerDTO = {
	id: string;
	name: string;
	email: string;
	phone: string | null;
	userId: string | null;
	createdAt: string;
	updatedAt: string;
};

function toCustomerDTO(row: typeof customers.$inferSelect): CustomerDTO {
	return {
		id: row.id,
		name: row.name,
		email: row.email,
		phone: row.phone,
		userId: row.userId,
		createdAt: row.createdAt.toISOString(),
		updatedAt: row.updatedAt.toISOString(),
	};
}

// ---------------------------------------------------------------------------
// Router
// ---------------------------------------------------------------------------

export const customersRouter = router({
	list: adminProcedure.input(listCustomersSchema).query(async ({ input }) => {
		const db = getDb();
		const conditions: SQL[] = [];

		if (input.search) {
			const pattern = `%${input.search}%`;
			const searchFilter = or(
				ilike(customers.name, pattern),
				ilike(customers.email, pattern),
				ilike(customers.phone, pattern),
			);
			if (searchFilter) conditions.push(searchFilter);
		}

		const where = conditions.length > 0 ? and(...conditions) : undefined;

		const [rows, totals] = await Promise.all([
			db
				.select()
				.from(customers)
				.where(where)
				.orderBy(desc(customers.createdAt))
				.limit(input.pageSize)
				.offset((input.page - 1) * input.pageSize),
			db
				.select({ count: sql<number>`count(*)::int` })
				.from(customers)
				.where(where),
		]);

		return {
			items: rows.map(toCustomerDTO),
			total: totals[0]?.count ?? 0,
			page: input.page,
			pageSize: input.pageSize,
		};
	}),

	getById: adminProcedure.input(z.uuid()).query(async ({ input }) => {
		const db = getDb();
		const [row] = await db
			.select()
			.from(customers)
			.where(eq(customers.id, input))
			.limit(1);
		if (!row) {
			throw new TRPCError({ code: "NOT_FOUND", message: "Customer not found" });
		}
		return toCustomerDTO(row);
	}),

	create: adminProcedure
		.input(customerInputSchema)
		.mutation(async ({ input }) => {
			const db = getDb();
			const [row] = await db.insert(customers).values(input).returning();
			if (!row) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Failed to create customer",
				});
			}
			return toCustomerDTO(row);
		}),

	update: adminProcedure
		.input(z.object({ id: z.uuid(), data: updateCustomerSchema }))
		.mutation(async ({ input }) => {
			const db = getDb();
			const [row] = await db
				.update(customers)
				.set(input.data)
				.where(eq(customers.id, input.id))
				.returning();
			if (!row) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Customer not found",
				});
			}
			return toCustomerDTO(row);
		}),

	delete: adminProcedure.input(z.uuid()).mutation(async ({ input }) => {
		const db = getDb();
		const [row] = await db
			.delete(customers)
			.where(eq(customers.id, input))
			.returning({ id: customers.id });
		if (!row) {
			throw new TRPCError({ code: "NOT_FOUND", message: "Customer not found" });
		}
		return row;
	}),
});

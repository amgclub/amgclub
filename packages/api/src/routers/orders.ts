import {
	customers,
	getDb,
	orderItems,
	orders,
	paymentSettings,
	products,
} from "@amgclub/db";
import { env } from "@amgclub/env/server";
import { TRPCError } from "@trpc/server";
import {
	and,
	asc,
	desc,
	eq,
	ilike,
	inArray,
	like,
	or,
	type SQL,
	sql,
} from "drizzle-orm";
import { z } from "zod";
import { adminProcedure, router } from "../index";
import {
	aedToFils,
	createPaymentIntent,
	type ZiinaPaymentIntent,
} from "../lib/ziina";
import { rateLimitedPublicProcedure } from "../rate-limit";

// ---------------------------------------------------------------------------
// Zod schemas
// ---------------------------------------------------------------------------

const orderStatusSchema = z.enum([
	"pending",
	"confirmed",
	"shipped",
	"delivered",
	"canceled",
]);
const paymentStatusSchema = z.enum(["pending", "paid", "failed", "refunded"]);

const shippingAddressSchema = z.object({
	name: z.string().min(1).max(200),
	phone: z.string().min(1).max(30),
	address: z.string().min(1).max(500),
	city: z.string().min(1).max(100),
	zip: z.string().max(20).nullish(),
});

const orderItemInputSchema = z.object({
	productId: z.uuid(),
	quantity: z.number().int().min(1).max(999).default(1),
});

const createOrderSchema = z.object({
	customerName: z.string().min(1, "Name is required").max(200),
	customerEmail: z
		.string()
		.email("Invalid email address")
		.toLowerCase()
		.max(200),
	customerPhone: z.string().min(1, "Phone is required").max(30),
	items: z.array(orderItemInputSchema).min(1, "At least one item is required"),
	shippingAddress: shippingAddressSchema,
	notes: z.string().max(500).nullish(),
});

const listOrdersSchema = z.object({
	status: orderStatusSchema.optional(),
	paymentStatus: paymentStatusSchema.optional(),
	search: z.string().trim().max(200).optional(),
	page: z.number().int().min(1).default(1),
	pageSize: z.number().int().min(1).max(100).default(50),
});

// ---------------------------------------------------------------------------
// DTOs
// ---------------------------------------------------------------------------

export type OrderItemDTO = {
	id: string;
	productId: string;
	name: string;
	price: number;
	quantity: number;
};

export type OrderDTO = {
	id: string;
	orderNumber: string;
	customerId: string;
	customerName: string;
	customerEmail: string;
	status: "pending" | "confirmed" | "shipped" | "delivered" | "canceled";
	paymentStatus: "pending" | "paid" | "failed" | "refunded";
	subtotal: number;
	shippingCost: number;
	total: number;
	shippingAddress: Record<string, unknown>;
	notes: string | null;
	items: OrderItemDTO[];
	createdAt: string;
	updatedAt: string;
};

function toOrderItemDTO(row: typeof orderItems.$inferSelect): OrderItemDTO {
	return {
		id: row.id,
		productId: row.productId,
		name: row.name,
		price: row.price,
		quantity: row.quantity,
	};
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Generate the next order number: AMG-YYYY-NNNN */
async function generateOrderNumber() {
	const db = getDb();
	const year = new Date().getFullYear();
	const prefix = `AMG-${year}-`;

	const [last] = await db
		.select({ orderNumber: orders.orderNumber })
		.from(orders)
		.where(like(orders.orderNumber, `${prefix}%`))
		.orderBy(desc(orders.orderNumber))
		.limit(1);

	const lastNum = last
		? Number.parseInt(last.orderNumber.replace(prefix, ""), 10)
		: 0;
	const next = (lastNum + 1).toString().padStart(4, "0");
	return `${prefix}${next}`;
}

// ---------------------------------------------------------------------------
// Router
// ---------------------------------------------------------------------------

export const ordersRouter = router({
	// ── Public: place an order ────────────────────────────────────────────

	create: rateLimitedPublicProcedure
		.input(createOrderSchema)
		.mutation(async ({ input }) => {
			const db = getDb();

			const result = await db.transaction(async (tx) => {
				// Fetch products for all items
				const productIds = input.items.map((i) => i.productId);
				const productRows = await tx
					.select()
					.from(products)
					.where(inArray(products.id, productIds));

				const productMap = new Map(productRows.map((p) => [p.id, p]));

				// Validate all products exist
				for (const item of input.items) {
					if (!productMap.has(item.productId)) {
						throw new TRPCError({
							code: "BAD_REQUEST",
							message: `Product not found: ${item.productId}`,
						});
					}
				}

				// Validate inventory
				let subtotal = 0;
				const orderItemValues: {
					productId: string;
					name: string;
					price: number;
					quantity: number;
				}[] = [];

				for (const item of input.items) {
					const product = productMap.get(item.productId)!;

					if (product.inventory < item.quantity) {
						throw new TRPCError({
							code: "BAD_REQUEST",
							message: `Insufficient stock for "${product.name}". Available: ${product.inventory}`,
						});
					}

					const price = product.price;
					subtotal += price * item.quantity;

					orderItemValues.push({
						productId: product.id,
						name: product.name,
						price,
						quantity: item.quantity,
					});

					// Decrement product inventory
					await tx
						.update(products)
						.set({ inventory: sql`${products.inventory} - ${item.quantity}` })
						.where(eq(products.id, product.id));
				}

				const shippingCost = 0;
				const total = subtotal + shippingCost;
				const orderNumber = await generateOrderNumber();

				// Upsert customer
				const [existingCustomer] = await tx
					.select({ id: customers.id })
					.from(customers)
					.where(eq(customers.email, input.customerEmail))
					.limit(1);

				let customerId: string;
				if (existingCustomer) {
					customerId = existingCustomer.id;
					// Update name/phone if changed
					await tx
						.update(customers)
						.set({
							name: input.customerName,
							phone: input.customerPhone,
							updatedAt: new Date(),
						})
						.where(eq(customers.id, customerId));
				} else {
					const [newCustomer] = await tx
						.insert(customers)
						.values({
							name: input.customerName,
							email: input.customerEmail,
							phone: input.customerPhone,
						})
						.returning();
					customerId = newCustomer!.id;
				}

				// Create order
				const [order] = await tx
					.insert(orders)
					.values({
						orderNumber,
						customerId,
						status: "pending",
						paymentStatus: "pending",
						subtotal,
						shippingCost,
						total,
						shippingAddress: input.shippingAddress,
						notes: input.notes,
					})
					.returning();

				if (!order) {
					throw new TRPCError({
						code: "INTERNAL_SERVER_ERROR",
						message: "Failed to create order",
					});
				}

				// Insert order items
				await tx.insert(orderItems).values(
					orderItemValues.map((item) => ({
						orderId: order.id,
						...item,
					})),
				);

				return {
					orderId: order.id,
					orderNumber: order.orderNumber,
					total,
				};
			});

			// Create Ziina payment intent (outside transaction — external API call)
			let paymentIntent: ZiinaPaymentIntent | null = null;
			try {
				const db = getDb();
				const [settings] = await db
					.select()
					.from(paymentSettings)
					.where(eq(paymentSettings.id, 1))
					.limit(1);

				const appUrl = env.PUBLIC_APP_URL;
				const isTestMode = !settings || settings.ziinaMode === "test";

				paymentIntent = await createPaymentIntent({
					amount: aedToFils(result.total),
					currency_code: "AED",
					message: `AMG Club Order #${result.orderNumber}`,
					success_url: `${appUrl}/payment/success?intent={PAYMENT_INTENT_ID}`,
					cancel_url: `${appUrl}/payment/cancel?intent={PAYMENT_INTENT_ID}`,
					test: isTestMode,
				});

				// Store payment intent ID on the order
				const updateDb = getDb();
				await updateDb
					.update(orders)
					.set({ paymentIntentId: paymentIntent.id })
					.where(eq(orders.id, result.orderId));
			} catch {
				// Payment intent creation failed — order remains pending
				// User can retry from confirmation page
			}

			return {
				success: true as const,
				orderNumber: result.orderNumber,
				orderId: result.orderId,
				total: result.total,
				redirectUrl: paymentIntent?.redirect_url ?? null,
			};
		}),

	// ── Public: verify payment after redirect from Ziina ────────────────

	verifyPayment: rateLimitedPublicProcedure
		.input(z.object({ paymentIntentId: z.string().min(1) }))
		.query(async ({ input }) => {
			const db = getDb();

			// Find order by payment intent ID
			const [order] = await db
				.select()
				.from(orders)
				.where(eq(orders.paymentIntentId, input.paymentIntentId))
				.limit(1);

			if (!order) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "No order found for this payment",
				});
			}

			// If already paid, skip Ziina API call
			if (order.paymentStatus === "paid") {
				return {
					paymentStatus: "paid" as const,
					orderNumber: order.orderNumber,
				};
			}

			// Fetch payment intent status from Ziina
			try {
				const { getPaymentIntent } = await import("../lib/ziina");
				const intent = await getPaymentIntent(input.paymentIntentId);

				let paymentStatus: "pending" | "paid" | "failed";
				switch (intent.status) {
					case "completed":
						paymentStatus = "paid";
						break;
					case "failed":
					case "canceled":
						paymentStatus = "failed";
						break;
					default:
						paymentStatus = "pending";
				}

				if (paymentStatus !== order.paymentStatus) {
					await db
						.update(orders)
						.set({ paymentStatus })
						.where(eq(orders.id, order.id));
				}

				return {
					paymentStatus,
					orderNumber: order.orderNumber,
				};
			} catch {
				// Ziina API call failed — return current DB status
				return {
					paymentStatus: order.paymentStatus as "pending" | "paid" | "failed",
					orderNumber: order.orderNumber,
				};
			}
		}),

	// ── Public: get order by number (for confirmation page) ───────────────

	getByOrderNumber: rateLimitedPublicProcedure
		.input(z.object({ orderNumber: z.string() }))
		.query(async ({ input }) => {
			const db = getDb();
			const [row] = await db
				.select()
				.from(orders)
				.where(eq(orders.orderNumber, input.orderNumber))
				.limit(1);

			if (!row) {
				throw new TRPCError({ code: "NOT_FOUND", message: "Order not found" });
			}

			const items = await db
				.select()
				.from(orderItems)
				.where(eq(orderItems.orderId, row.id))
				.orderBy(asc(orderItems.id));

			const [cust] = await db
				.select({ name: customers.name, email: customers.email })
				.from(customers)
				.where(eq(customers.id, row.customerId))
				.limit(1);

			return {
				id: row.id,
				orderNumber: row.orderNumber,
				status: row.status,
				paymentStatus: row.paymentStatus,
				subtotal: row.subtotal,
				shippingCost: row.shippingCost,
				total: row.total,
				shippingAddress: row.shippingAddress,
				notes: row.notes,
				customerName: cust?.name ?? "",
				customerEmail: cust?.email ?? "",
				items: items.map(toOrderItemDTO),
				createdAt: row.createdAt.toISOString(),
				updatedAt: row.updatedAt.toISOString(),
			};
		}),

	// ── Admin: list ──────────────────────────────────────────────────────

	list: adminProcedure.input(listOrdersSchema).query(async ({ input }) => {
		const db = getDb();
		const conditions: SQL[] = [];

		if (input.status) conditions.push(eq(orders.status, input.status));
		if (input.paymentStatus)
			conditions.push(eq(orders.paymentStatus, input.paymentStatus));
		if (input.search) {
			const pattern = `%${input.search}%`;
			const searchFilter = or(
				ilike(orders.orderNumber, pattern),
				ilike(customers.name, pattern),
				ilike(customers.email, pattern),
			);
			if (searchFilter) conditions.push(searchFilter);
		}

		const where = conditions.length > 0 ? and(...conditions) : undefined;

		const [rows, totals] = await Promise.all([
			db
				.select({
					id: orders.id,
					orderNumber: orders.orderNumber,
					customerId: orders.customerId,
					status: orders.status,
					paymentStatus: orders.paymentStatus,
					subtotal: orders.subtotal,
					shippingCost: orders.shippingCost,
					total: orders.total,
					shippingAddress: orders.shippingAddress,
					notes: orders.notes,
					createdAt: orders.createdAt,
					updatedAt: orders.updatedAt,
				})
				.from(orders)
				.leftJoin(customers, eq(orders.customerId, customers.id))
				.where(where)
				.orderBy(desc(orders.createdAt))
				.limit(input.pageSize)
				.offset((input.page - 1) * input.pageSize),
			db
				.select({ count: sql<number>`count(*)::int` })
				.from(orders)
				.leftJoin(customers, eq(orders.customerId, customers.id))
				.where(where),
		]);

		// Fetch customer names and item counts
		const enriched = await Promise.all(
			rows.map(async (row) => {
				const [cust] = await db
					.select({ name: customers.name, email: customers.email })
					.from(customers)
					.where(eq(customers.id, row.customerId))
					.limit(1);

				const items = await db
					.select()
					.from(orderItems)
					.where(eq(orderItems.orderId, row.id));

				return {
					id: row.id,
					orderNumber: row.orderNumber,
					customerId: row.customerId,
					customerName: cust?.name ?? "",
					customerEmail: cust?.email ?? "",
					status: row.status,
					paymentStatus: row.paymentStatus,
					subtotal: row.subtotal,
					shippingCost: row.shippingCost,
					total: row.total,
					shippingAddress: row.shippingAddress,
					notes: row.notes,
					items: items.map(toOrderItemDTO),
					createdAt: row.createdAt.toISOString(),
					updatedAt: row.updatedAt.toISOString(),
				};
			}),
		);

		return {
			items: enriched,
			total: totals[0]?.count ?? 0,
			page: input.page,
			pageSize: input.pageSize,
		};
	}),

	// ── Admin: get by id ─────────────────────────────────────────────────

	getById: adminProcedure.input(z.uuid()).query(async ({ input }) => {
		const db = getDb();
		const [row] = await db
			.select()
			.from(orders)
			.where(eq(orders.id, input))
			.limit(1);
		if (!row) {
			throw new TRPCError({ code: "NOT_FOUND", message: "Order not found" });
		}

		const [items, custRows] = await Promise.all([
			db.select().from(orderItems).where(eq(orderItems.orderId, row.id)),
			db
				.select({
					name: customers.name,
					email: customers.email,
					phone: customers.phone,
				})
				.from(customers)
				.where(eq(customers.id, row.customerId))
				.limit(1),
		]);

		const cust = custRows[0];

		return {
			id: row.id,
			orderNumber: row.orderNumber,
			customerId: row.customerId,
			customerName: cust?.name ?? "",
			customerEmail: cust?.email ?? "",
			customerPhone: cust?.phone ?? "",
			status: row.status,
			paymentStatus: row.paymentStatus,
			subtotal: row.subtotal,
			shippingCost: row.shippingCost,
			total: row.total,
			shippingAddress: row.shippingAddress as Record<string, unknown>,
			notes: row.notes,
			items: items.map(toOrderItemDTO),
			createdAt: row.createdAt.toISOString(),
			updatedAt: row.updatedAt.toISOString(),
		};
	}),

	// ── Admin: update status ─────────────────────────────────────────────

	updateStatus: adminProcedure
		.input(z.object({ id: z.uuid(), status: orderStatusSchema }))
		.mutation(async ({ input }) => {
			const db = getDb();
			const [row] = await db
				.update(orders)
				.set({ status: input.status })
				.where(eq(orders.id, input.id))
				.returning();
			if (!row) {
				throw new TRPCError({ code: "NOT_FOUND", message: "Order not found" });
			}
			return { success: true as const, status: row.status };
		}),

	// ── Admin: update payment status ─────────────────────────────────────

	updatePaymentStatus: adminProcedure
		.input(z.object({ id: z.uuid(), paymentStatus: paymentStatusSchema }))
		.mutation(async ({ input }) => {
			const db = getDb();
			const [row] = await db
				.update(orders)
				.set({ paymentStatus: input.paymentStatus })
				.where(eq(orders.id, input.id))
				.returning();
			if (!row) {
				throw new TRPCError({ code: "NOT_FOUND", message: "Order not found" });
			}
			return { success: true as const, paymentStatus: row.paymentStatus };
		}),

	// ── Admin: cancel order (restores inventory) ─────────────────────────

	cancel: adminProcedure.input(z.uuid()).mutation(async ({ input }) => {
		const db = getDb();

		return await db.transaction(async (tx) => {
			const [row] = await tx
				.update(orders)
				.set({ status: "canceled", paymentStatus: "refunded" })
				.where(eq(orders.id, input))
				.returning();

			if (!row) {
				throw new TRPCError({ code: "NOT_FOUND", message: "Order not found" });
			}

			// Restore inventory
			const items = await tx
				.select()
				.from(orderItems)
				.where(eq(orderItems.orderId, input));

			for (const item of items) {
				await tx
					.update(products)
					.set({ inventory: sql`${products.inventory} + ${item.quantity}` })
					.where(eq(products.id, item.productId));
			}

			return { success: true as const, status: row.status };
		});
	}),
});

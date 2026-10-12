import { sql } from "drizzle-orm";
import {
	check,
	index,
	integer,
	jsonb,
	numeric,
	pgEnum,
	pgTable,
	text,
	timestamp,
	uuid,
} from "drizzle-orm/pg-core";

// ---------------------------------------------------------------------------
// Enums
// ---------------------------------------------------------------------------

export const productStatusEnum = pgEnum("product_status", [
	"draft",
	"active",
	"archived",
]);

export const orderStatusEnum = pgEnum("order_status", [
	"pending",
	"confirmed",
	"shipped",
	"delivered",
	"canceled",
]);

export const paymentStatusEnum = pgEnum("payment_status", [
	"pending",
	"paid",
	"failed",
	"refunded",
]);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** AED price stored as decimal(10,2), read/written as a JS number. */
function aedPrice(name: string) {
	return numeric(name, { precision: 10, scale: 2, mode: "number" });
}

// ---------------------------------------------------------------------------
// Products
// ---------------------------------------------------------------------------

export const products = pgTable(
	"products",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		name: text("name").notNull(),
		slug: text("slug").notNull().unique(),
		description: text("description"),
		price: aedPrice("price").notNull(),
		compareAtPrice: aedPrice("compare_at_price"),
		status: productStatusEnum("status").notNull().default("draft"),
		inventory: integer("inventory").notNull().default(0),
		sku: text("sku"),
		weight: numeric("weight", { precision: 8, scale: 2, mode: "number" }),
		createdAt: timestamp("created_at", { withTimezone: true })
			.defaultNow()
			.notNull(),
		updatedAt: timestamp("updated_at", { withTimezone: true })
			.defaultNow()
			.notNull()
			.$onUpdate(() => new Date()),
	},
	(table) => [
		index("products_slug_idx").on(table.slug),
		index("products_status_idx").on(table.status),
		check("products_price_non_negative_check", sql`${table.price} >= 0`),
		check(
			"products_inventory_non_negative_check",
			sql`${table.inventory} >= 0`,
		),
	],
);

// ---------------------------------------------------------------------------
// Product images
// ---------------------------------------------------------------------------

export const productImages = pgTable(
	"product_images",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		productId: uuid("product_id")
			.notNull()
			.references(() => products.id, { onDelete: "cascade" }),
		url: text("url").notNull(),
		altText: text("alt_text"),
		sortOrder: integer("sort_order").notNull().default(0),
		createdAt: timestamp("created_at", { withTimezone: true })
			.defaultNow()
			.notNull(),
	},
	(table) => [index("product_images_product_id_idx").on(table.productId)],
);

// ---------------------------------------------------------------------------
// Customers
// ---------------------------------------------------------------------------

export const customers = pgTable(
	"customers",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		name: text("name").notNull(),
		email: text("email").notNull().unique(),
		phone: text("phone"),
		userId: text("user_id"),
		createdAt: timestamp("created_at", { withTimezone: true })
			.defaultNow()
			.notNull(),
		updatedAt: timestamp("updated_at", { withTimezone: true })
			.defaultNow()
			.notNull()
			.$onUpdate(() => new Date()),
	},
	(table) => [
		index("customers_email_idx").on(table.email),
		index("customers_user_id_idx").on(table.userId),
	],
);

// ---------------------------------------------------------------------------
// Orders
// ---------------------------------------------------------------------------

export const orders = pgTable(
	"orders",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		orderNumber: text("order_number").notNull().unique(),
		customerId: uuid("customer_id")
			.notNull()
			.references(() => customers.id, { onDelete: "restrict" }),
		status: orderStatusEnum("status").notNull().default("pending"),
		paymentStatus: paymentStatusEnum("payment_status")
			.notNull()
			.default("pending"),
		subtotal: aedPrice("subtotal").notNull(),
		shippingCost: aedPrice("shipping_cost").notNull().default(0),
		total: aedPrice("total").notNull(),
		shippingAddress: jsonb("shipping_address").notNull(),
		notes: text("notes"),
		/** Ziina payment intent ID — links this order to its payment. */
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
		index("orders_customer_id_idx").on(table.customerId),
		index("orders_status_idx").on(table.status),
		index("orders_created_at_idx").on(table.createdAt),
	],
);

// ---------------------------------------------------------------------------
// Order items
// ---------------------------------------------------------------------------

export const orderItems = pgTable(
	"order_items",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		orderId: uuid("order_id")
			.notNull()
			.references(() => orders.id, { onDelete: "cascade" }),
		productId: uuid("product_id").references(() => products.id, {
			onDelete: "set null",
		}),
		name: text("name").notNull(),
		price: aedPrice("price").notNull(),
		quantity: integer("quantity").notNull().default(1),
	},
	(table) => [
		index("order_items_order_id_idx").on(table.orderId),
		index("order_items_product_id_idx").on(table.productId),
	],
);

// ---------------------------------------------------------------------------
// Type exports
// ---------------------------------------------------------------------------

export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;

export type ProductImage = typeof productImages.$inferSelect;
export type NewProductImage = typeof productImages.$inferInsert;

export type Customer = typeof customers.$inferSelect;
export type NewCustomer = typeof customers.$inferInsert;

export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;

export type OrderItem = typeof orderItems.$inferSelect;
export type NewOrderItem = typeof orderItems.$inferInsert;

import { getDb, productImages, products } from "@amgclub/db";
import { TRPCError } from "@trpc/server";
import {
	and,
	asc,
	desc,
	eq,
	ilike,
	inArray,
	or,
	type SQL,
	sql,
} from "drizzle-orm";
import { z } from "zod";
import { shopCache } from "../cache";
import { adminProcedure, router } from "../index";
import { rateLimitedPublicProcedure } from "../rate-limit";

// ---------------------------------------------------------------------------
// Zod schemas
// ---------------------------------------------------------------------------

const productStatusSchema = z.enum(["draft", "active", "archived"]);

const listProductsSchema = z.object({
	status: productStatusSchema.optional(),
	search: z.string().trim().max(200).optional(),
	page: z.number().int().min(1).default(1),
	pageSize: z.number().int().min(1).max(100).default(50),
});

const productInputSchema = z.object({
	name: z.string().min(1, "Name is required").max(200),
	slug: z.string().min(1).max(200),
	description: z.string().max(8000).nullish(),
	price: z.number().min(0, "Price must be zero or more").max(1_000_000),
	compareAtPrice: z.number().min(0).max(1_000_000).nullish(),
	status: productStatusSchema.default("draft"),
	inventory: z.number().int().min(0).default(0),
	sku: z.string().max(60).nullish(),
	weight: z.number().min(0).max(999).nullish(),
});

const updateProductSchema = productInputSchema.partial();

// ---------------------------------------------------------------------------
// DTOs
// ---------------------------------------------------------------------------

export type ProductDTO = {
	id: string;
	name: string;
	slug: string;
	description: string | null;
	price: number;
	compareAtPrice: number | null;
	status: "draft" | "active" | "archived";
	inventory: number;
	sku: string | null;
	weight: number | null;
	images: ProductImageDTO[];
	createdAt: string;
	updatedAt: string;
};

export type ProductImageDTO = {
	id: string;
	url: string;
	altText: string | null;
	sortOrder: number;
};

function toImageDTO(row: typeof productImages.$inferSelect): ProductImageDTO {
	return {
		id: row.id,
		url: row.url,
		altText: row.altText,
		sortOrder: row.sortOrder,
	};
}

function toProductDTO(
	row: typeof products.$inferSelect,
	opts?: {
		images?: ProductImageDTO[];
	},
): ProductDTO {
	return {
		id: row.id,
		name: row.name,
		slug: row.slug,
		description: row.description,
		price: row.price,
		compareAtPrice: row.compareAtPrice,
		status: row.status,
		inventory: row.inventory,
		sku: row.sku,
		weight: row.weight,
		images: opts?.images ?? [],
		createdAt: row.createdAt.toISOString(),
		updatedAt: row.updatedAt.toISOString(),
	};
}

// ---------------------------------------------------------------------------
// Router
// ---------------------------------------------------------------------------

export const shopRouter = router({
	// ── Public: list active products ──────────────────────────────────────

	publicList: rateLimitedPublicProcedure
		.input(
			z.object({
				search: z.string().trim().max(200).optional(),
				page: z.number().int().min(1).default(1),
				pageSize: z.number().int().min(1).max(100).default(24),
			}),
		)
		.query(async ({ input }) => {
			const db = getDb();
			const cacheKey = shopCache.productList(JSON.stringify(input));

			return shopCache.cache(cacheKey, shopCache.ttl.productList, async () => {
				const conditions: SQL[] = [eq(products.status, "active")];

				if (input.search) {
					const pattern = `%${input.search}%`;
					const searchFilter = or(
						ilike(products.name, pattern),
						ilike(products.description, pattern),
						ilike(products.sku, pattern),
					);
					if (searchFilter) conditions.push(searchFilter);
				}

				const where = and(...conditions);

				const [rows, totals] = await Promise.all([
					db
						.select()
						.from(products)
						.where(where)
						.orderBy(desc(products.createdAt))
						.limit(input.pageSize)
						.offset((input.page - 1) * input.pageSize),
					db
						.select({ count: sql<number>`count(*)::int` })
						.from(products)
						.where(where),
				]);

				const productIds = rows.map((r) => r.id);
				const allImages =
					productIds.length > 0
						? await db
								.select()
								.from(productImages)
								.where(inArray(productImages.productId, productIds))
								.orderBy(asc(productImages.sortOrder))
						: [];
				const imagesByProduct = new Map<string, typeof allImages>();
				for (const img of allImages) {
					const list = imagesByProduct.get(img.productId) ?? [];
					list.push(img);
					imagesByProduct.set(img.productId, list);
				}

				return {
					items: rows.map((r) =>
						toProductDTO(r, {
							images: (imagesByProduct.get(r.id) ?? []).map(toImageDTO),
						}),
					),
					total: totals[0]?.count ?? 0,
					page: input.page,
					pageSize: input.pageSize,
				};
			});
		}),

	// ── Public: get product by slug ───────────────────────────────────────

	publicGetBySlug: rateLimitedPublicProcedure
		.input(z.object({ slug: z.string() }))
		.query(async ({ input }) => {
			const db = getDb();
			const cacheKey = shopCache.productBySlug(input.slug);

			return shopCache.cache(cacheKey, shopCache.ttl.product, async () => {
				const [row] = await db
					.select()
					.from(products)
					.where(
						and(eq(products.slug, input.slug), eq(products.status, "active")),
					)
					.limit(1);

				if (!row) {
					throw new TRPCError({
						code: "NOT_FOUND",
						message: "Product not found",
					});
				}

				const [images] = await Promise.all([
					db
						.select()
						.from(productImages)
						.where(eq(productImages.productId, row.id))
						.orderBy(asc(productImages.sortOrder)),
				]);

				return toProductDTO(row, {
					images: images.map(toImageDTO),
				});
			});
		}),

	// ── Public: get products by ids ───────────────────────────────────────

	publicGetByIds: rateLimitedPublicProcedure
		.input(z.object({ ids: z.array(z.uuid()).min(1).max(500) }))
		.query(async ({ input }) => {
			const db = getDb();

			const rows = await db
				.select()
				.from(products)
				.where(
					and(inArray(products.id, input.ids), eq(products.status, "active")),
				);

			const productIds = rows.map((r) => r.id);
			const allImages =
				productIds.length > 0
					? await db
							.select()
							.from(productImages)
							.where(inArray(productImages.productId, productIds))
							.orderBy(asc(productImages.sortOrder))
					: [];
			const imagesByProduct = new Map<string, typeof allImages>();
			for (const img of allImages) {
				const list = imagesByProduct.get(img.productId) ?? [];
				list.push(img);
				imagesByProduct.set(img.productId, list);
			}

			return {
				items: rows.map((r) =>
					toProductDTO(r, {
						images: (imagesByProduct.get(r.id) ?? []).map(toImageDTO),
					}),
				),
			};
		}),

	// ── Admin: list products ──────────────────────────────────────────────

	list: adminProcedure.input(listProductsSchema).query(async ({ input }) => {
		const db = getDb();
		const conditions: SQL[] = [];

		if (input.status) conditions.push(eq(products.status, input.status));
		if (input.search) {
			const pattern = `%${input.search}%`;
			const searchFilter = or(
				ilike(products.name, pattern),
				ilike(products.sku, pattern),
			);
			if (searchFilter) conditions.push(searchFilter);
		}

		const where = conditions.length > 0 ? and(...conditions) : undefined;

		const [rows, totals] = await Promise.all([
			db
				.select()
				.from(products)
				.where(where)
				.orderBy(desc(products.createdAt))
				.limit(input.pageSize)
				.offset((input.page - 1) * input.pageSize),
			db
				.select({ count: sql<number>`count(*)::int` })
				.from(products)
				.where(where),
		]);

		const productIds = rows.map((r) => r.id);
		const allImages =
			productIds.length > 0
				? await db
						.select()
						.from(productImages)
						.where(inArray(productImages.productId, productIds))
						.orderBy(asc(productImages.sortOrder))
				: [];
		const imagesByProduct = new Map<string, typeof allImages>();
		for (const img of allImages) {
			const list = imagesByProduct.get(img.productId) ?? [];
			list.push(img);
			imagesByProduct.set(img.productId, list);
		}

		return {
			items: rows.map((r) =>
				toProductDTO(r, {
					images: (imagesByProduct.get(r.id) ?? []).map(toImageDTO),
				}),
			),
			total: totals[0]?.count ?? 0,
			page: input.page,
			pageSize: input.pageSize,
		};
	}),

	// ── Admin: get product by id ──────────────────────────────────────────

	getById: adminProcedure.input(z.uuid()).query(async ({ input }) => {
		const db = getDb();
		const [row] = await db
			.select()
			.from(products)
			.where(eq(products.id, input))
			.limit(1);
		if (!row) {
			throw new TRPCError({ code: "NOT_FOUND", message: "Product not found" });
		}

		const [images] = await Promise.all([
			db
				.select()
				.from(productImages)
				.where(eq(productImages.productId, row.id))
				.orderBy(asc(productImages.sortOrder)),
		]);

		return toProductDTO(row, {
			images: images.map(toImageDTO),
		});
	}),

	// ── Admin: create product ─────────────────────────────────────────────

	create: adminProcedure
		.input(productInputSchema)
		.mutation(async ({ input }) => {
			const db = getDb();

			return await db.transaction(async (tx) => {
				const [row] = await tx.insert(products).values(input).returning();

				if (!row) {
					throw new TRPCError({
						code: "INTERNAL_SERVER_ERROR",
						message: "Failed to create product",
					});
				}

				await shopCache.invalidateProduct(row.slug);

				return toProductDTO(row);
			});
		}),

	// ── Admin: update product ─────────────────────────────────────────────

	update: adminProcedure
		.input(z.object({ id: z.uuid(), data: updateProductSchema }))
		.mutation(async ({ input }) => {
			const db = getDb();

			return await db.transaction(async (tx) => {
				const [existing] = await tx
					.select({ slug: products.slug })
					.from(products)
					.where(eq(products.id, input.id));
				if (!existing) {
					throw new TRPCError({
						code: "NOT_FOUND",
						message: "Product not found",
					});
				}

				const [row] = await tx
					.update(products)
					.set(input.data)
					.where(eq(products.id, input.id))
					.returning();

				if (!row) {
					throw new TRPCError({
						code: "NOT_FOUND",
						message: "Product not found",
					});
				}

				await shopCache.invalidateProduct(existing.slug);
				if (row.slug !== existing.slug) {
					await shopCache.invalidateProduct(row.slug);
				}

				return toProductDTO(row);
			});
		}),

	// ── Admin: update product images ──────────────────────────────────────

	updateImages: adminProcedure
		.input(
			z.object({
				productId: z.uuid(),
				images: z.array(
					z.object({
						id: z.uuid().optional(),
						url: z.string().url(),
						altText: z.string().max(200).nullish(),
						sortOrder: z.number().int().min(0).default(0),
					}),
				),
			}),
		)
		.mutation(async ({ input }) => {
			const db = getDb();

			return await db.transaction(async (tx) => {
				const [existing] = await tx
					.select({ id: products.id })
					.from(products)
					.where(eq(products.id, input.productId));
				if (!existing) {
					throw new TRPCError({
						code: "NOT_FOUND",
						message: "Product not found",
					});
				}

				// Replace all images
				await tx
					.delete(productImages)
					.where(eq(productImages.productId, input.productId));

				if (input.images.length > 0) {
					await tx.insert(productImages).values(
						input.images.map((img) => ({
							productId: input.productId,
							url: img.url,
							altText: img.altText,
							sortOrder: img.sortOrder,
						})),
					);
				}

				const rows = await tx
					.select()
					.from(productImages)
					.where(eq(productImages.productId, input.productId))
					.orderBy(asc(productImages.sortOrder));

				return rows.map(toImageDTO);
			});
		}),

	// ── Admin: delete product ─────────────────────────────────────────────

	delete: adminProcedure.input(z.uuid()).mutation(async ({ input }) => {
		const db = getDb();
		const [row] = await db
			.delete(products)
			.where(eq(products.id, input))
			.returning({ id: products.id, slug: products.slug });
		if (!row) {
			throw new TRPCError({ code: "NOT_FOUND", message: "Product not found" });
		}
		await shopCache.invalidateProduct(row.slug);
		return row;
	}),
});

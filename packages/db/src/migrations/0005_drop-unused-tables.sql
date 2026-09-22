ALTER TABLE "order_items" DROP CONSTRAINT "order_items_variant_id_product_variants_id_fk";--> statement-breakpoint
ALTER TABLE "products" DROP CONSTRAINT "products_category_id_categories_id_fk";--> statement-breakpoint
ALTER TABLE "order_items" DROP COLUMN "variant_id";--> statement-breakpoint
ALTER TABLE "products" DROP COLUMN "category_id";--> statement-breakpoint
ALTER TABLE "products" DROP COLUMN "has_variants";--> statement-breakpoint
DROP TABLE "collection_products";--> statement-breakpoint
DROP TABLE "product_variants";--> statement-breakpoint
DROP TABLE "collections";--> statement-breakpoint
DROP TABLE "categories";--> statement-breakpoint
DROP INDEX "products_category_id_idx";

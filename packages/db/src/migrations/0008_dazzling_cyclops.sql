ALTER TABLE "order_items" DROP CONSTRAINT "order_items_product_id_products_id_fk";
--> statement-breakpoint
ALTER TABLE "order_items" ALTER COLUMN "product_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;
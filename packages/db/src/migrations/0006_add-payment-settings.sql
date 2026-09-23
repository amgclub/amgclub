CREATE TABLE "payment_settings" (
	"id" integer PRIMARY KEY DEFAULT 1,
	"ziina_mode" text NOT NULL DEFAULT 'test',
	"ziina_webhook_secret" text,
	"ziina_webhook_url" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "payment_settings_singleton_check" CHECK ("payment_settings"."id" = 1),
	CONSTRAINT "payment_settings_ziina_mode_check" CHECK ("payment_settings"."ziina_mode" in ('test', 'live'))
);--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "payment_intent_id" text;--> statement-breakpoint
ALTER TABLE "event_attendees" ADD COLUMN "payment_status" text DEFAULT 'pending';--> statement-breakpoint
ALTER TABLE "event_attendees" ADD COLUMN "payment_intent_id" text;

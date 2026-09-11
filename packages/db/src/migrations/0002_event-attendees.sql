DO $$ BEGIN
	CREATE TYPE "public"."event_attendee_status" AS ENUM('attending', 'canceled');
EXCEPTION
	WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "public"."event_attendees" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_id" uuid NOT NULL REFERENCES "public"."events"("id") ON DELETE cascade,
	"user_id" text,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text NOT NULL,
	"status" "public"."event_attendee_status" DEFAULT 'attending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "public"."event_attendees" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "event_attendees_event_id_idx" ON "public"."event_attendees" ("event_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "event_attendees_email_idx" ON "public"."event_attendees" ("email");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "event_attendees_status_idx" ON "public"."event_attendees" ("status");
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "event_attendees_event_id_email_idx" ON "public"."event_attendees" ("event_id", "email");

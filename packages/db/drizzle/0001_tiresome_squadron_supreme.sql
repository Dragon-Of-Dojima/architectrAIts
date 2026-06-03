ALTER TABLE "buildings" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "buildings" ADD COLUMN "ai_model" text;--> statement-breakpoint
ALTER TABLE "buildings" ADD COLUMN "ai_processed_at" timestamp with time zone;
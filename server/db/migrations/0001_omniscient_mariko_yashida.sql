ALTER TABLE "user" ADD COLUMN "reset_token" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "reset_token_expires_at" timestamp;
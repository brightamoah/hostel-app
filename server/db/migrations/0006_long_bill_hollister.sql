CREATE TYPE "public"."visitor_log_action" AS ENUM('check_in', 'check_out');--> statement-breakpoint
ALTER TABLE "visitor_logs" ADD COLUMN "action" "visitor_log_action" NOT NULL;--> statement-breakpoint
ALTER TABLE "visitor_logs" ADD COLUMN "timestamp" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "visitor_logs" DROP COLUMN "check_in_time";--> statement-breakpoint
ALTER TABLE "visitor_logs" DROP COLUMN "check_out_time";--> statement-breakpoint
ALTER TABLE "visitor_logs" DROP COLUMN "created_at";--> statement-breakpoint
ALTER TABLE "visitor_logs" DROP COLUMN "updated_at";
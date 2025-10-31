CREATE TYPE "public"."admin_status" AS ENUM('active', 'inactive');--> statement-breakpoint
ALTER TABLE "admin" ADD COLUMN "status" "admin_status" DEFAULT 'active' NOT NULL;
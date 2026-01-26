ALTER TYPE "public"."allocation_period" RENAME TO "academic_period";--> statement-breakpoint
ALTER TABLE "billing" ADD COLUMN "academic_period" "academic_period" DEFAULT 'first semester' NOT NULL;--> statement-breakpoint
ALTER TABLE "allocation" ADD COLUMN "academic_period" "academic_period" DEFAULT 'first semester' NOT NULL;--> statement-breakpoint
ALTER TABLE "allocation" DROP COLUMN "allocation_period";
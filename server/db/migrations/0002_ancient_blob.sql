ALTER TABLE "hostel" DROP CONSTRAINT "hostel_code_unique";--> statement-breakpoint
ALTER TABLE "hostel" DROP COLUMN "code";--> statement-breakpoint
ALTER TABLE "hostel" ADD CONSTRAINT "hostel_name_unique" UNIQUE("name");
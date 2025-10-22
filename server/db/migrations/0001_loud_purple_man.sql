ALTER TABLE "admin" ADD COLUMN "hostel_id" integer;--> statement-breakpoint
ALTER TABLE "admin" ADD CONSTRAINT "admin_hostel_id_hostel_id_fk" FOREIGN KEY ("hostel_id") REFERENCES "public"."hostel"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "admin" ADD CONSTRAINT "chk_hostel_for_regular_support" CHECK (
    (access_level IN ('regular', 'support') AND hostel_id IS NOT NULL)
    OR (access_level = 'super' AND hostel_id IS NULL)
  );
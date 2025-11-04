ALTER TABLE "visitor" ADD COLUMN "hostel_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "visitor" ADD COLUMN "admin_id" integer;--> statement-breakpoint
ALTER TABLE "visitor_logs" ADD COLUMN "admin_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "visitor" ADD CONSTRAINT "visitor_hostel_id_hostel_id_fk" FOREIGN KEY ("hostel_id") REFERENCES "public"."hostel"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "visitor" ADD CONSTRAINT "visitor_admin_id_admin_id_fk" FOREIGN KEY ("admin_id") REFERENCES "public"."admin"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "visitor_logs" ADD CONSTRAINT "visitor_logs_admin_id_admin_id_fk" FOREIGN KEY ("admin_id") REFERENCES "public"."admin"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "visitor" DROP COLUMN "check_in_time";--> statement-breakpoint
ALTER TABLE "visitor" DROP COLUMN "check_out_time";--> statement-breakpoint
ALTER TABLE "visitor" ADD CONSTRAINT "chk_visit_date" CHECK ("visit_date" >= CURRENT_DATE);
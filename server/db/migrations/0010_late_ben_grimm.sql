ALTER TABLE "announcement" ALTER COLUMN "target_audience" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "announcement" ALTER COLUMN "target_audience" SET DEFAULT 'all'::text;--> statement-breakpoint
DROP TYPE "public"."target_audience";--> statement-breakpoint
CREATE TYPE "public"."target_audience" AS ENUM('all', 'students', 'admins', 'hostel', 'room', 'user');--> statement-breakpoint
ALTER TABLE "announcement" ALTER COLUMN "target_audience" SET DEFAULT 'all'::"public"."target_audience";--> statement-breakpoint
ALTER TABLE "announcement" ALTER COLUMN "target_audience" SET DATA TYPE "public"."target_audience" USING "target_audience"::"public"."target_audience";--> statement-breakpoint
ALTER TABLE "announcement" ADD COLUMN "target_hostel_id" integer;--> statement-breakpoint
ALTER TABLE "announcement" ADD COLUMN "target_room_id" integer;--> statement-breakpoint
ALTER TABLE "announcement" ADD COLUMN "target_user_id" integer;--> statement-breakpoint
ALTER TABLE "announcement" ADD CONSTRAINT "announcement_target_hostel_id_hostel_id_fk" FOREIGN KEY ("target_hostel_id") REFERENCES "public"."hostel"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "announcement" ADD CONSTRAINT "announcement_target_room_id_room_id_fk" FOREIGN KEY ("target_room_id") REFERENCES "public"."room"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "announcement" ADD CONSTRAINT "announcement_target_user_id_user_id_fk" FOREIGN KEY ("target_user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
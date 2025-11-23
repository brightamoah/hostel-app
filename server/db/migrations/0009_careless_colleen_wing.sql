ALTER TABLE "room" DROP CONSTRAINT "unique_room";--> statement-breakpoint
ALTER TABLE "room" DROP COLUMN "building";--> statement-breakpoint
ALTER TABLE "room" ADD CONSTRAINT "unique_room_number" UNIQUE("room_number","hostel_id");

ALTER TABLE "room" ADD COLUMN "hostel_id" integer;--> statement-breakpoint

-- Populate hostel_id by matching room.building to hostel.name
UPDATE "room"
SET
    "hostel_id" = "hostel"."id"
FROM "hostel"
WHERE
    "room"."building" = "hostel"."name";

ALTER TABLE "room" DROP CONSTRAINT "unique_room";--> statement-breakpoint

ALTER TABLE "room" ALTER COLUMN "hostel_id" SET NOT NULL;

ALTER TABLE "room" ADD CONSTRAINT "room_hostel_id_hostel_id_fk" FOREIGN KEY ("hostel_id") REFERENCES "public"."hostel"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "room" ADD CONSTRAINT "unique_room" UNIQUE("room_number","building","hostel_id");
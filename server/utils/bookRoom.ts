import { and, eq, inArray } from "drizzle-orm";

import { allocation, room } from "../db/schema";

export async function bookRoom(
  studentId: number,
  roomId: number,
  endDate?: Date,
) {
  const { db } = useDB();

  const allocationDate = new Date().toISOString();
  const defaultEndDate = new Date();
  defaultEndDate.setMonth(defaultEndDate.getMonth() + 8);

  const allocationEndDate = (endDate ? new Date(endDate) : defaultEndDate).toISOString();

  return await db
    .transaction(async (tx) => {
      const existingAllocation = await tx.query.allocation.findFirst({
        where: and(
          eq(allocation.studentId, studentId),
          inArray(allocation.status, ["active", "pending"]),
        ),
      });

      if (existingAllocation) {
        throw createError({
          statusCode: 400,
          message: "You already has an active or pending room allocation.",
        });
      }

      const [targetRoom] = await tx
        .select()
        .from(room)
        .where(eq(room.id, roomId))
        .for("update");

      if (!targetRoom) {
        throw createError({
          statusCode: 404,
          message: "Room not found.",
        });
      }

      if (targetRoom.status === "under maintenance") {
        throw createError({
          statusCode: 400,
          message: "You cannot book this room. It is currently under maintenance.",
        });
      }

      if (targetRoom.status === "reserved") {
        throw createError({
          statusCode: 400,
          message: "You cannot book room. It is reserved.",
        });
      }

      if (targetRoom.currentOccupancy >= targetRoom.capacity) {
        throw createError({
          statusCode: 400,
          message: "This room is fully occupied.",
        });
      }

      const [newAllocation] = await tx
        .insert(allocation)
        .values({
          studentId,
          roomId,
          allocationDate,
          status: "pending",
          endDate: allocationEndDate,
        })
        .returning();

      const newOccupancy = targetRoom.currentOccupancy + 1;

      let newStatus: typeof room.$inferSelect.status = "partially occupied";

      if (newOccupancy >= targetRoom.capacity) {
        newStatus = "fully occupied";
      }
      else if (newOccupancy > 0 && newOccupancy < targetRoom.capacity) {
        newStatus = "partially occupied";
      }

      await tx.update(room)
        .set({
          currentOccupancy: newOccupancy,
          status: newStatus,
        })
        .where(eq(room.id, roomId));

      return newAllocation;
    });
}

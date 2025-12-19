import { and, eq, inArray } from "drizzle-orm";

import { allocation, billing, room } from "../db/schema";

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

  const billDueDate = new Date();
  billDueDate.setMonth(billDueDate.getMonth() + 7);
  const billingDueDate = billDueDate.toISOString();

  return await db
    .transaction(async (tx) => {
      const hasOverdueBills = await tx
        .query
        .billing
        .findFirst({
          where: and(
            eq(billing.studentId, studentId),
            eq(billing.status, "overdue"),
          ),
        });

      if (hasOverdueBills) {
        throw createError({
          statusCode: 400,
          message: "You cannot book a new room while you have outstanding overdue bills. Please clear your debt first.",
        });
      }

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
        } satisfies typeof allocation.$inferInsert)
        .returning();

      await tx
        .insert(billing)
        .values({
          studentId,
          allocationId: newAllocation.id,
          amount: targetRoom.amountPerYear.toString(),
          description: `Accommodation Fee for Room ${targetRoom.roomNumber}`,
          dateIssued: new Date(),
          dueDate: billingDueDate,
          status: "unpaid",
          paidAmount: "0.00",
          hostelId: targetRoom.hostelId,
        } satisfies typeof billing.$inferInsert)
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

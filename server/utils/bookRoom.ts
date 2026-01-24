import { and, eq, inArray, sql } from "drizzle-orm";

import { allocation, billing, room, student } from "../db/schema";

export async function bookRoom(
  studentId: number,
  roomId: number,
  endDate?: Date,
) {
  const { db } = useDB();

  const now = new Date();
  const allocationDate = now.toISOString();
  const defaultEndDate = new Date(now);
  defaultEndDate.setMonth(defaultEndDate.getMonth() + 8);

  const allocationEndDate = (endDate ? new Date(endDate) : defaultEndDate).toISOString();

  const billDueDate = new Date(now);
  billDueDate.setMonth(billDueDate.getMonth() + 7);
  const billingDueDate = billDueDate.toISOString();

  return await db
    .transaction(async (tx) => {
      const [hasOverdueBills, existingAllocation, studentRecord] = await Promise.all([
        tx
          .query
          .billing
          .findFirst({
            columns: { id: true },
            where: and(
              eq(billing.studentId, studentId),
              eq(billing.status, "overdue"),
            ),
          }),

        tx.query.allocation.findFirst({
          where: and(
            eq(allocation.studentId, studentId),
            inArray(allocation.status, ["active", "pending"]),
          ),
        }),

        tx.query.student.findFirst({
          columns: { gender: true },
          where: eq(student.id, studentId),
        }),
      ]);

      if (hasOverdueBills) {
        throw createError({
          statusCode: 400,
          message: "You cannot book a new room while you have outstanding overdue bills. Please clear your debt first.",
        });
      }

      if (existingAllocation) {
        throw createError({
          statusCode: 400,
          message: "You already has an active or pending room allocation.",
        });
      }

      if (!studentRecord) {
        throw createError({
          statusCode: 404,
          message: "Student record not found.",
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

      if (targetRoom.allowedGender !== studentRecord.gender) {
        throw createError({
          statusCode: 400,
          message: `You cannot book this room. It is reserved for ${targetRoom.allowedGender} students.`,
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

      if (!newAllocation) throw createError({ statusCode: 500, message: "Failed to create allocation" });

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

      await tx.update(room)
        .set({
          currentOccupancy: sql`${room.currentOccupancy} + 1`,
          status: sql`
          CASE
            WHEN ${room.currentOccupancy} + 1 >= ${room.capacity} THEN 'fully occupied'::room_status
            ELSE 'partially occupied'::room_status
          END`,
        })
        .where(eq(room.id, roomId));

      return newAllocation;
    });
}

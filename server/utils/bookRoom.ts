import type { H3Event } from "h3";

import { and, eq, inArray, sql } from "drizzle-orm";

import { allocation, billing, room, student } from "../db/schema";

export async function bookRoom(
  studentId: number,
  roomId: number,
  event: H3Event,
  endDate?: Date,
) {
  const { db } = useDB(event);

  const now = new Date();
  const allocationDate = now.toISOString();
  const defaultEndDate = new Date(now);
  defaultEndDate.setMonth(defaultEndDate.getMonth() + 8);

  const allocationEndDate = (endDate ? new Date(endDate) : defaultEndDate).toISOString();

  const billDueDate = new Date(now);
  billDueDate.setMonth(billDueDate.getMonth() + 1);
  const billingDueDate = billDueDate.toISOString();

  const academicPeriod = getAcademicPeriod(
    new Date(allocationDate),
    new Date(allocationEndDate),
  );

  return await db
    .transaction(async (tx) => {
      const [hasOverdueBills, existingAllocation, studentRecord] = await Promise.all([
        tx
          .select({ id: billing.id })
          .from(billing)
          .where(and(
            eq(billing.studentId, studentId),
            eq(billing.status, "overdue"),
          ))
          .limit(1)
          .then(rows => rows[0]),

        tx
          .select()
          .from(allocation)
          .where(and(
            eq(allocation.studentId, studentId),
            inArray(allocation.status, ["active", "pending"]),
          ))
          .limit(1)
          .then(rows => rows[0]),

        tx
          .select({ gender: student.gender })
          .from(student)
          .where(eq(student.id, studentId))
          .limit(1)
          .then(rows => rows[0]),
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
          academicPeriod,
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

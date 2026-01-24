import { room } from "~~/server/db/schema";
import { and, sql } from "drizzle-orm";

export default defineEventHandler(async (event) => {
  const { adminData } = await adminSessionCheck(event);

  if (adminData.accessLevel !== "super") {
    throw createError({
      statusCode: 403,
      message: "Forbidden: You do not have permission to perform this action.",
    });
  }

  try {
    const { db } = useDB();
    await db.update(room)
      .set({ allowedGender: "male" })
      .where(
        and(
          sql`${room.capacity} > ${room.currentOccupancy}`,
          sql`${room.floor} % 2 != 0`, // odd floors are male
        ),
      )
      .returning();

    await db.update(room)
      .set({ allowedGender: "female" })
      .where(
        and(
          sql`${room.capacity} > ${room.currentOccupancy}`,
          sql`${room.floor} % 2 = 0`, // even floors are female
        ),
      )
      .returning();

    return {
      success: true,
      message: "Room genders assigned successfully based on floor parity.",
    };
  }
  catch (error) {
    if (error && typeof error === "object" && "statusCode" in error) throw error;

    handleError(error, "User Login", event);
  }
});

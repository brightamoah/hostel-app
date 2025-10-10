import { room } from "~~/server/db/schema";
import { eq } from "drizzle-orm";

import { addRoomSchema } from "~/utils/schema";

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event);

  if (!session || !session.user || session.user.role !== "admin") {
    throw createError({
      statusCode: 403,
      message: "Access denied: Must be a verified admin",
    });
  }

  try {
    const { db } = useDB();

    const body = await readValidatedBody(event, body => addRoomSchema.safeParse(body));

    if (!body.success) {
      throw createError({
        statusCode: 400,
        message: `Invalid data: ${body.error.issues.map(i => i.message).join(", ")}`,
      });
    }

    const {
      amountPerYear,
      building,
      capacity,
      currentOccupancy,
      features,
      floor,
      roomNumber,
      roomType,
      status,
    } = body.data;

    const missingFields: string[] = [];
    switch (true) {
      case !amountPerYear:
        missingFields.push("amountPerYear");
        break;
      case !building:
        missingFields.push("building");
        break;
      case !capacity:
        missingFields.push("capacity");
        break;
      case currentOccupancy === undefined:
        missingFields.push("currentOccupancy");
        break;
      case !features:
        missingFields.push("features");
        break;
      case !floor:
        missingFields.push("floor");
        break;
      case !roomNumber:
        missingFields.push("roomNumber");
        break;
      case !roomType:
        missingFields.push("roomType");
        break;
      case !status:
        missingFields.push("status");
        break;
    }

    if (missingFields.length > 0) {
      throw createError({
        statusCode: 400,
        message: `Missing required fields: ${missingFields.join(", ")}`,
      });
    }

    const existingRoom = await db.query.room.findFirst({
      where: eq(room.roomNumber, roomNumber),
    });

    if (existingRoom) {
      throw createError({
        statusCode: 409,
        message: "Room with this number already exists",
      });
    }

    const [newRoom] = await db.insert(room).values({
      roomNumber,
      building,
      floor,
      capacity,
      roomType,
      currentOccupancy,
      features,
      amountPerYear,
      status,
    } as any).returning();

    if (!newRoom) {
      throw createError({
        statusCode: 500,
        message: "Failed to save room details",
      });
    }

    return {
      success: true,
      message: "Room added successfully",
    };
  }
  catch (error: any) {
    console.error("Error adding new room:", error);

    if (error.code === "23505")
      throw createError({ statusCode: 409, message: "Room with this number already exists" });

    if (error && typeof error === "object" && "statusCode" in error) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      message: error.message,
      cause: error.cause,
    });
  }
});

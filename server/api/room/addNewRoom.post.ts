import { roomQueries } from "~~/server/db/queries";
import { handleError } from "~~/server/utils/errorHandler";

export default defineEventHandler(async (event) => {
  await adminSessionCheck(event);

  try {
    const { getExistingRoomByRoomNumberAndHostel, addNewRoom } = await roomQueries();

    const body = await readValidatedBody(event, body => addRoomSchema.safeParse(body));

    if (!body.success) {
      throw createError({
        statusCode: 400,
        message: `Invalid data: ${body.error.issues.map(i => i.message).join(", ")}`,
      });
    }

    const {
      amountPerYear,
      hostelId,
      capacity,
      currentOccupancy,
      features,
      floor,
      roomNumber,
      roomType,
      status,
      allowedGender,
    } = body.data;

    if (roomType === "" || status === "" || allowedGender === "") {
      throw createError({
        statusCode: 400,
        message: "Room type, status, and allowed gender must be provided",
      });
    }

    const existingRoom = await getExistingRoomByRoomNumberAndHostel(roomNumber, hostelId);

    if (existingRoom) {
      throw createError({
        statusCode: 409,
        message: "Room with this number already exists",
      });
    }

    const newRoom = await addNewRoom({
      amountPerYear,
      hostelId,
      capacity,
      currentOccupancy,
      features,
      floor,
      roomNumber,
      roomType,
      status,
      allowedGender,
    });

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

    if (error.code === "23505") throw createError({ statusCode: 409, message: "Room with this number already exists" });

    if (error && typeof error === "object" && "statusCode" in error) throw error;

    handleError(error, "Add New Room", event);
  }
});

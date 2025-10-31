import { roomQueries } from "~~/server/db/queries/room";
import { handleError } from "~~/server/utils/errorHandler";

import { editRoomSchema } from "~/utils/schema";

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event);

  if (
    !session
    || !session.user
    || session.user.role !== "admin"
    || !session.user.adminData
    || session.user.adminData.status !== "active"
  ) {
    throw createError({
      statusCode: 403,
      message: "Access denied: Must be a logged in verified admin",
    });
  }

  try {
    const { editRoomById, getRoomById, getRoomByNumberAndBuilding } = await roomQueries(event);

    const body = await readValidatedBody(event, body => editRoomSchema.safeParse(body));

    if (!body.success) {
      throw createError({
        statusCode: 400,
        message: `Invalid data: ${body.error.issues.map(i => i.message).join(", ")}`,
      });
    }

    const { roomId, data } = body.data;

    const existingRoom = await getRoomById(roomId);

    if (!existingRoom) {
      throw createError({
        statusCode: 404,
        message: "Room not found",
      });
    }

    // If room number is being updated, check for uniqueness
    const newRoomNumber = data.roomNumber;
    const newBuilding = data.building;

    const isUniqueKeyChanged = (newRoomNumber
      && newRoomNumber !== existingRoom.roomNumber) || (newBuilding && newBuilding !== existingRoom.building);

    if (isUniqueKeyChanged) {
      // Use the new values if provided, otherwise fallback to the existing ones.
      const checkNumber = newRoomNumber ?? existingRoom.roomNumber;
      const checkBuilding = newBuilding ?? existingRoom.building;

      const conflictingRoom = await getRoomByNumberAndBuilding(checkNumber, checkBuilding);

      if (conflictingRoom && conflictingRoom.id !== roomId) {
        throw createError({
          statusCode: 409,
          message: `A room with number ${checkNumber} in ${checkBuilding} already exists.`,
        });
      }
    }

    const updatedRoom = await editRoomById(roomId, data);

    if (!updatedRoom) {
      throw createError({
        statusCode: 500,
        message: "Failed to update room details.",
      });
    }

    return {
      success: true,
      message: "Room updated successfully",
      room: updatedRoom,
    };
  }
  catch (error) {
    if (error && typeof error === "object" && "statusCode" in error) {
      throw error;
    }

    handleError(error, "Edit Room", event);
  }
});

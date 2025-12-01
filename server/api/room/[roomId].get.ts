import { roomQueries } from "~~/server/db/queries/room";
import { handleError } from "~~/server/utils/errorHandler";

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event);

  if (!session || !session.user) {
    throw createError({
      statusCode: 403,
      message: "Access denied: Must be a loggedIn verified user",
    });
  }

  try {
    const { getRoomById } = await roomQueries();

    const id = getRouterParam(event, "roomId");

    if (!id || Number.isNaN(Number(id))) {
      throw createError({
        statusCode: 400,
        statusMessage: "Invalid or missing Room ID.",
      });
    }

    const roomId = Number(id);

    const room = await getRoomById(roomId);
    if (!room) {
      throw createError({
        statusCode: 404,
        message: "Room not found",
      });
    }

    return { room };
  }
  catch (error) {
    if (error && typeof error === "object" && "statusCode" in error)
      throw error;

    handleError(error, "Get Room by ID", event);
  }
});

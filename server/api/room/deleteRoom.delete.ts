import { roomQueries } from "~~/server/db/queries/room";

import { getSpecificRoomError } from "~/utils/roomErrors";
import { deleteRoomSchema } from "~/utils/schema";

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event);
  const { getErrorMessage } = getSpecificRoomError();

  if (!session || !session.user || session.user.role !== "admin") {
    throw createError({
      statusCode: 403,
      message: "Access denied: Must be a logged in verified admin",
    });
  }

  try {
    const body = await readValidatedBody(event, body => deleteRoomSchema.safeParse(body));

    if (!body.success) {
      throw createError({
        statusCode: 400,
        message: `${body.error.issues
          .map(i => i.message)
          .join(", ")}`,
      });
    }

    const ids = body.data.ids;

    const { deleteRoomsByIds } = await roomQueries(event);

    const deletedRooms = await deleteRoomsByIds(ids);

    if (deletedRooms.length === 0) {
      throw createError({
        statusCode: 404,
        message: `No rooms found with the provided IDs: ${ids.join(", ")}`,
      });
    }

    return {
      success: true,
      message: `${deletedRooms.length} room(s) successfully deleted.`,
    };
  }
  catch (error: any) {
    if (error && typeof error === "object" && "statusCode" in error) {
      throw error;
    }

    const errorMessage = getErrorMessage(error);

    throw createError({
      statusCode: 500,
      message: errorMessage.message,
      cause: error.cause,
    });
  }
});

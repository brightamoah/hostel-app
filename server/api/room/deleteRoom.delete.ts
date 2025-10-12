import { roomQueries } from "~~/server/db/queries/room";

import { deleteRoomSchema } from "~/utils/schema";

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event);

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
        message: `Invalid request: ${body.error.issues
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
  catch (error) {
    if (error && typeof error === "object" && "statusCode" in error) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      message: `Server error: ${(error as Error).message || "An unknown server error occurred."}`,
    });
  }
});

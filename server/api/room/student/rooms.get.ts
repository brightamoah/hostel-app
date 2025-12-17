import { roomQueries } from "~~/server/db/queries";

export default defineEventHandler(async (event) => {
  await requireUserSession(event, {
    message: "Unauthorized Access: Please log in to continue.",
  });

  try {
    const { getAvailableRooms, getAllHostels } = await roomQueries();

    const rooms = await getAvailableRooms();

    const hostels = await getAllHostels();

    return {
      rooms,
      hostels,
    };
  }
  catch (error) {
    if (error && typeof error === "object" && "statusCode" in error) throw error;

    handleError(error, "Get Student Room Data", event);
  }
});

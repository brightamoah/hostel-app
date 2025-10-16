import { roomQueries } from "~~/server/db/queries/room";
import { handleError } from "~~/server/utils/errorHandler";

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event);

  if (!session || !session.user || session.user.role !== "admin") {
    throw createError({
      statusCode: 403,
      message: "Access denied: Must be a verified admin",
    });
  }

  try {
    const {
      getAllRooms,
      getRoomsUnderMaintenance,
      getOccupiedRoomsCount,
      getOccupiedRooms,
      getAvailableRooms,
      getUniqueBuildings,
    } = await roomQueries(event);

    const allRooms = await getAllRooms();
    if (!allRooms)
      throw createError({ statusCode: 404, message: "No rooms found" });

    const totalRooms: number = allRooms.length;

    const occupiedRooms = await getOccupiedRooms();

    const totalOccupiedRooms: number = await getOccupiedRoomsCount();

    const underMaintenance = await getRoomsUnderMaintenance();

    const totalUnderMaintenance: number = underMaintenance.length;

    const availableRooms = await getAvailableRooms();

    const totalAvailableRooms: number = availableRooms.length;

    const buildings = await getUniqueBuildings();

    return {
      rooms: allRooms,
      availableRooms,
      totalRooms,
      occupiedRooms,
      underMaintenance,
      totalUnderMaintenance,
      totalOccupiedRooms,
      totalAvailableRooms,
      buildings,
    };
  }
  catch (error) {
    if (error && typeof error === "object" && "statusCode" in error) {
      throw error;
    }

    handleError(error, "Get Room Data", event);
  }
});

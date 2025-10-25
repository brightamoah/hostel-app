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
      getUniqueBuildings,
      getAllHostels,
      getRoomsScoped,
      getBuildingsByHostelId,
    } = await roomQueries(event);

    const {
      rooms,
      totalAvailableRooms,
      totalRooms,
      totalOccupiedRooms,
      totalUnderMaintenance,
      adminRecord,
    } = await getRoomsScoped(session.user.id);

    let buildings, hostels;

    if (adminRecord && adminRecord.accessLevel === "super") {
      buildings = await getUniqueBuildings();
      hostels = await getAllHostels();
    }
    else {
      buildings = await getBuildingsByHostelId(adminRecord.hostelId!);
    }

    return {
      rooms,
      totalRooms,
      totalUnderMaintenance,
      totalOccupiedRooms,
      totalAvailableRooms,
      buildings,
      hostels,
    };
  }
  catch (error) {
    if (error && typeof error === "object" && "statusCode" in error) {
      throw error;
    }

    handleError(error, "Get Room Data", event);
  }
});

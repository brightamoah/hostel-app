import { roomQueries } from "~~/server/db/queries/room";
import { handleError } from "~~/server/utils/errorHandler";

export default defineEventHandler(async (event) => {
  const { adminData } = await adminSessionCheck(event);

  try {
    const {
      getRoomStatusCount,
      getAllHostelsScoped,
      getScopedRooms,
    } = await roomQueries();

    const {
      totalRooms,
      totalOccupiedRooms,
      totalUnderMaintenance,
      totalAvailableRooms,
      totalVacantRooms,
      totalFullyOccupiedRooms,
      totalPartiallyOccupiedRooms,
      totalReservedRooms,
    } = await getRoomStatusCount(adminData);

    const hostels: Hostel[] = await getAllHostelsScoped(adminData);
    const rooms = await getScopedRooms(adminData);

    return {
      rooms,
      totalRooms,
      totalOccupiedRooms,
      totalAvailableRooms,
      totalUnderMaintenance,
      totalFullyOccupiedRooms,
      totalVacantRooms,
      totalPartiallyOccupiedRooms,
      totalReservedRooms,
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

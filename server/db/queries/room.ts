import { asc, eq, gt, inArray, or } from "drizzle-orm";

import { room } from "../schema";

export const roomQueries = defineEventHandler(async () => {
  const { db } = useDB();

  const getAllRooms = async () => {
    const rooms = await db.query.room.findMany({ limit: 100, orderBy: (room, { asc }) => [asc(room.id)] });
    return rooms;
  };

  const getRoomById = async (id: number) => {
    const existingRoom = await db.query.room.findFirst({ where: eq(room.id, id) });
    return existingRoom;
  };

  const getRoomsCount = async () => {
    const count = await db.query.room.findMany().then(rooms => rooms.length);
    return count;
  };

  const getOccupiedRoomsCount = async () => {
    const count = await db.query.room.findMany().then(rooms => rooms.filter(r => r.currentOccupancy > 0).length);
    return count;
  };

  const getRoomsUnderMaintenance = async () => {
    const rooms = await db.query.room.findMany({ where: eq(room.status, "under maintenance") });
    return rooms;
  };

  const getOccupiedRooms = async () => {
    const rooms = await db.select().from(room).where(gt(room.currentOccupancy, 0));
    return rooms;
  };

  const getAvailableRooms = async () => {
    const rooms = await db.query.room.findMany({
      where: or(
        eq(room.status, "vacant"),
        eq(room.status, "partially occupied"),
      ),
    });
    return rooms;
  };

  const getUniqueBuildings = async () => {
    const buildings = await db.selectDistinct({ building: room.building }).from(room).orderBy(asc(room.building));
    return buildings;
  };

  const deleteRoomsByIds = async (ids: number[]) => {
    if (ids.length === 0)
      return [];

    const deletedRooms = await db
      .delete(room)
      .where(inArray(room.id, ids))
      .returning();

    return deletedRooms;
  };

  return {
    getAllRooms,
    getRoomById,
    getRoomsCount,
    getOccupiedRoomsCount,
    getRoomsUnderMaintenance,
    getOccupiedRooms,
    getAvailableRooms,
    getUniqueBuildings,
    deleteRoomsByIds,
  };
});

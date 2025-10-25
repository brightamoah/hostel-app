import { and, asc, eq, gt, inArray, or } from "drizzle-orm";

import { hostel, room } from "../schema";
import { userQueries } from "./user";

export const roomQueries = defineEventHandler(async (event) => {
  const { db } = useDB();
  const { getAdminByUserId } = await userQueries(event);

  const getAllRooms = async () => {
    const rooms = await db
      .query
      .room
      .findMany({ limit: 100, orderBy: (room, { asc }) => [asc(room.id)] });
    return rooms;
  };

  const getRoomById = async (id: number) => {
    const existingRoom = await db
      .query
      .room
      .findFirst({ where: eq(room.id, id) });
    return existingRoom;
  };

  const getRoomsByIds = async (ids: number[]) => {
    const rooms = await db
      .query
      .room
      .findMany({ where: inArray(room.id, ids) });
    return rooms;
  };

  const getRoomsCount = async () => {
    const count = await db
      .query
      .room
      .findMany()
      .then(rooms => rooms.length);
    return count;
  };

  const getOccupiedRoomsCount = async () => {
    const count = await db
      .query
      .room
      .findMany()
      .then(rooms => rooms.filter(r => r.currentOccupancy > 0).length);
    return count;
  };

  const getRoomsUnderMaintenance = async () => {
    const rooms = await db
      .query
      .room
      .findMany({ where: eq(room.status, "under maintenance") });
    return rooms;
  };

  const getOccupiedRooms = async () => {
    const rooms = await db
      .select()
      .from(room)
      .where(gt(room.currentOccupancy, 0));
    return rooms;
  };

  const getAvailableRooms = async () => {
    const rooms = await db
      .query
      .room
      .findMany({
        where: or(
          eq(room.status, "vacant"),
          eq(room.status, "partially occupied"),
        ),
      });
    return rooms;
  };

  const getUniqueBuildings = async () => {
    const buildings = await db
      .selectDistinct({ building: room.building })
      .from(room)
      .orderBy(asc(room.building));
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

  const editRoomById = async (roomId: number, data: Partial<typeof room.$inferInsert>) => {
    const [updatedRoom] = await db
      .update(room)
      .set(data)
      .where(eq(room.id, roomId))
      .returning();

    return updatedRoom;
  };

  const getRoomByNumberAndBuilding = async (roomNumber: string, building: string) => {
    return await db.query.room.findFirst({
      where: and(
        eq(room.roomNumber, roomNumber),
        eq(room.building, building),
      ),
    });
  };

  const getAllHostels = async () => {
    const hostels = await db
      .query
      .hostel
      .findMany({ where: eq(hostel.status, "active") });
    return hostels;
  };

  const getBuildingsByHostelId = async (hostelId: number) => {
    const buildings = await db
      .selectDistinct({ building: room.building })
      .from(room)
      .where(eq(room.hostelId, hostelId))
      .orderBy(asc(room.building));
    return buildings;
  };

  const getRoomsScoped = async (adminId: number) => {
    const adminRecord = await getAdminByUserId(adminId);
    if (!adminRecord) {
      throw createError({
        statusCode: 404,
        message: "Admin not found",
      });
    }

    const query = db.select().from(room).leftJoin(hostel, eq(room.hostelId, hostel.id));

    if (adminRecord.accessLevel !== "super") {
      if (!adminRecord.hostelId) {
        throw createError({
          statusCode: 403,
          message: "Access denied: Your admin account is not assigned to a hostel.",
        });
      }

      query.where(eq(room.hostelId, adminRecord.hostelId));
    }

    const result = await query.orderBy(asc(room.id)).limit(100);

    const rooms = result.map(r => ({ ...r.room, hostel: r.hostel }));

    const totalRooms = rooms.length;
    const totalOccupiedRooms = rooms.filter(r => r.currentOccupancy > 0).length;
    const totalAvailableRooms = rooms.filter(r =>
      r.status === "vacant" || r.status === "partially occupied",
    ).length;
    const totalUnderMaintenance = rooms.filter(r => r.status === "under maintenance").length;

    return {
      rooms,
      totalRooms,
      totalOccupiedRooms,
      totalAvailableRooms,
      totalUnderMaintenance,
      adminRecord,
    };
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
    editRoomById,
    getRoomByNumberAndBuilding,
    getRoomsByIds,
    getAllHostels,
    getRoomsScoped,
    getBuildingsByHostelId,
  };
});

import type { Admin } from "~~/shared/types";

import { useDB } from "~~/server/utils/db";
import { and, asc, countDistinct, eq, gt, inArray, or, sql } from "drizzle-orm";

import { allocation, hostel, room } from "../schema";

const roomWithRelations = {
  with: {
    hostel: true,
  },
} as const;

export async function roomQueries() {
  const { db } = useDB();

  const getAllRooms = async () => {
    const rooms = await db
      .query
      .room
      .findMany({ limit: 100, orderBy: asc(room.id) });
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
        ...roomWithRelations,
        where: or(
          eq(room.status, "vacant"),
          eq(room.status, "partially occupied"),
        ),
      });
    return rooms;
  };

  const getExistingRoomByRoomNumberAndHostel = async (roomNumber: string, hostelId: number) => {
    const existingRoom = await db
      .query
      .room
      .findFirst({
        where: and(
          eq(room.roomNumber, roomNumber),
          eq(room.hostelId, hostelId),
        ),
      });

    return existingRoom;
  };

  const deleteRoomsByIds = async (ids: number[]) => {
    if (ids.length === 0) return [];

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

  const getAllHostels = async () => {
    const hostels = await db
      .query
      .hostel
      .findMany({ where: eq(hostel.status, "active") });
    return hostels;
  };

  const getScopedHostels = (hostelId?: number) => {
    let query = db
      .select()
      .from(hostel)
      .where(eq(hostel.status, "active"))
      .$dynamic();

    if (hostelId) query = query.where(eq(hostel.id, hostelId));

    return query;
  };

  const getScopedRooms = async (admin: Admin) => {
    if (admin.accessLevel === "super") {
      return await db
        .query
        .room
        .findMany({ ...roomWithRelations });
    }

    if (!admin.hostelId) return [];

    return await db
      .query
      .room
      .findMany({
        ...roomWithRelations,
        where: eq(room.hostelId, admin.hostelId),
      });
  };

  const addNewRoom = async (data: typeof room.$inferInsert) => {
    const [newRoom] = await db
      .insert(room)
      .values(data)
      .returning();

    return newRoom;
  };

  const getAllHostelsScoped = async (admin: Admin) => {
    if (admin.accessLevel === "super") {
      return await db
        .query
        .hostel
        .findMany();
    }

    if (!admin.hostelId) return [];

    return await db
      .query
      .hostel
      .findMany({ where: eq(hostel.id, admin.hostelId) });
  };

  const getRoomStatusCount = async (admin: Admin) => {
    const whereConditions = [];

    if (admin.accessLevel !== "super") {
      if (!admin.hostelId) return { vacant: 0, fullyOccupied: 0, partiallyOccupied: 0, underMaintenance: 0, reserved: 0 };

      whereConditions.push(eq(room.hostelId, admin.hostelId));
    }

    const [result] = await db
      .select({
        vacant: countDistinct(sql`CASE WHEN ${room.status} = 'vacant' THEN ${room.id} END`),
        fullyOccupied: countDistinct(sql`CASE WHEN ${room.status} = 'fully occupied' THEN ${room.id} END`),
        partiallyOccupied: countDistinct(sql`CASE WHEN ${room.status} = 'partially occupied' THEN ${room.id} END`),
        underMaintenance: countDistinct(sql`CASE WHEN ${room.status} = 'under maintenance' THEN ${room.id} END`),
        reserved: countDistinct(sql`CASE WHEN ${room.status} = 'reserved' THEN ${room.id} END`),
        available: countDistinct(sql`CASE WHEN ${room.status} IN ('vacant', 'partially occupied') THEN ${room.id} END`),
        allRooms: countDistinct(room.id),
        occupied: countDistinct(sql`CASE WHEN ${room.currentOccupancy} > 0 THEN ${room.id} END`),
      })
      .from(room)
      .where(and(...whereConditions));

    return {
      totalVacantRooms: Number(result?.vacant),
      totalFullyOccupiedRooms: Number(result?.fullyOccupied),
      totalPartiallyOccupiedRooms: Number(result?.partiallyOccupied),
      totalUnderMaintenance: Number(result?.underMaintenance),
      totalReservedRooms: Number(result?.reserved),
      totalAvailableRooms: Number(result?.available),
      totalRooms: Number(result?.allRooms),
      totalOccupiedRooms: Number(result?.occupied),
    };
  };

  const cancelAllocation = async (allocationId: number) => {
    return await db.transaction(async (tx) => {
      const [targetAllocation] = await tx
        .select()
        .from(allocation)
        .where(eq(allocation.id, allocationId))
        .for("update");

      if (!targetAllocation) throw new Error("Allocation not found");
      if (targetAllocation.status === "cancelled" || targetAllocation.status === "expired") return targetAllocation;

      const [updatedAllocation] = await tx
        .update(allocation)
        .set({ status: "cancelled" })
        .where(eq(allocation.id, allocationId))
        .returning();

      const [targetRoom] = await tx
        .select()
        .from(room)
        .where(eq(room.id, targetAllocation.roomId))
        .for("update");

      if (targetRoom) {
        const newOccupancy = Math.max(0, targetRoom.currentOccupancy - 1);

        let newStatus: typeof room.$inferSelect.status = "partially occupied";

        if (newOccupancy === 0) {
          newStatus = "vacant";
        }
        else if (newOccupancy < targetRoom.capacity) {
          newStatus = "partially occupied";
        }
        else {
          newStatus = "fully occupied";
        }

        await tx
          .update(room)
          .set({
            currentOccupancy: newOccupancy,
            status: newStatus,
          })
          .where(eq(room.id, targetAllocation.roomId));
      }

      return updatedAllocation;
    });
  };

  return {
    getAllRooms,
    getRoomById,
    getOccupiedRoomsCount,
    getRoomsUnderMaintenance,
    getOccupiedRooms,
    getAvailableRooms,
    deleteRoomsByIds,
    editRoomById,
    getRoomsByIds,
    getAllHostels,
    getScopedHostels,
    addNewRoom,
    getExistingRoomByRoomNumberAndHostel,
    getScopedRooms,
    getAllHostelsScoped,
    getRoomStatusCount,
    cancelAllocation,
  };
}

type RoomWithRelations = Awaited<ReturnType<Awaited<ReturnType<typeof roomQueries>>["getScopedRooms"]>>;

export type Room = NonNullable<RoomWithRelations>[number];

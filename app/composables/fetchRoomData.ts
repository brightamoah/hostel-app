import type { Room, RoomDataResponse } from "~/types";

export async function useFetchRoomData() {
  const { data, status, refresh } = await useFetch<RoomDataResponse>("/api/room/getRoomData", {
    method: "get",
    key: "roomData",
    lazy: true,
    default: () => ({
      rooms: [],
      totalRooms: 0,
      totalOccupiedRooms: 0,
      totalAvailableRooms: 0,
      totalUnderMaintenance: 0,
      buildings: [],
    }),
  });

  const rooms = computed<Room[]>(() => {
    const raw = data.value?.rooms ?? [];
    return (raw as any[]).map(r => ({
      ...r,
      features:
        typeof r.features === "string" && r.features
          ? [r.features]
          : Array.isArray(r.features)
            ? r.features
            : [],
    })) as Room[];
  });

  return {
    rooms,
    data,
    status,
    refresh,
  };
}

import type { SelectMenuItem } from "@nuxt/ui";

export function useFetchRoomData() {
  const { user } = useUserSession();

  const { data, status, refresh, error } = useFetch<RoomDataResponse>("/api/room/getRoomData", {
    method: "get",
    key: computed(() => `roomData:${user.value?.adminData?.accessLevel}`),
    lazy: true,
    cache: "default",
    default: () => ({
      rooms: [],
      totalRooms: 0,
      totalOccupiedRooms: 0,
      totalAvailableRooms: 0,
      totalUnderMaintenance: 0,
      totalFullyOccupiedRooms: 0,
      totalVacantRooms: 0,
      totalPartiallyOccupiedRooms: 0,
      totalReservedRooms: 0,
      hostels: [],
    }),
    getCachedData: (key, nuxtApp, ctx) => {
      if (ctx.cause === "refresh:manual" || ctx.cause === "refresh:hook") return undefined;
      return nuxtApp.payload.data[key] ?? nuxtApp.static.data[key];
    },
  });

  const rooms = computed<Room[]>(() => data.value?.rooms ?? []);

  const hostels = computed(() => data.value?.hostels ?? []);

  const hostelItem = computed<SelectMenuItem[]>(() =>
    hostels.value.map(h => ({ label: h.name, value: h.id })));

  const {
    canResend,
    coolDownTime,
    isLoading,
    handleRefresh,
  } = useDataRefresh(
    "roomDataCoolDown",
    "useFetchRoomData",
    refresh,
  );

  return {
    rooms,
    data,
    status,
    coolDownTime,
    isLoading,
    canResend,
    hostels,
    hostelItem,
    error,
    refresh,
    handleRefresh,
  };
}

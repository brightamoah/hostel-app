import type { SelectMenuItem } from "@nuxt/ui";

export function useFetchStudentRoomData() {
  const { user } = useUserSession();

  const { data, status, refresh } = useFetch<StudentRoomData>("/api/room/student/rooms", {
    method: "GET",
    key: computed(() => `roomData:${user.value?.role}`),
    lazy: true,
    cache: "default",
    default: () => ({
      rooms: [],
      hostels: [],
      totalRooms: 0,
    }),
    getCachedData: (key, nuxtApp, ctx) => {
      if (ctx.cause === "refresh:manual" || ctx.cause === "refresh:hook") return undefined;
      return nuxtApp.payload.data[key] ?? nuxtApp.static.data[key];
    },
  });

  const rooms = computed<Room[]>(() => data.value.rooms ?? []);

  const hostels = computed<Hostel[]>(() => data.value.hostels ?? []);

  const hostelItem = computed<SelectMenuItem[]>(() =>
    hostels.value.map(h => ({ label: h.name, value: h.id })));

  const {
    canResend,
    coolDownTime,
    isLoading,
    handleRefresh,
  } = useDataRefresh(
    "roomDataCoolDown",
    "useFetchStudentRoomData",
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
    refresh,
    handleRefresh,
  };
}

import type { SelectMenuItem } from "@nuxt/ui";

import type { Room, RoomDataResponse } from "~/types";

const REFRESH_COOL_DOWN_SECONDS = 120;

export function useFetchRoomData() {
  const { data, status, refresh } = useFetch<RoomDataResponse>("/api/room/getRoomData", {
    method: "get",
    key: "roomData",
    lazy: true,
    cache: "default",
    default: () => ({
      rooms: [],
      totalRooms: 0,
      totalOccupiedRooms: 0,
      totalAvailableRooms: 0,
      totalUnderMaintenance: 0,
      buildings: [],
      hostels: [],
    }),
    getCachedData: (key, nuxtApp, ctx) => {
      if (ctx.cause === "refresh:manual")
        return undefined;
      return nuxtApp.payload.data[key] ?? nuxtApp.static.data[key];
    },
  });

  const coolDownTime = useCookie<number>("roomDataCoolDown", {
    default: () => 0,
    maxAge: 60 * 60 * 24 * 7,
    sameSite: "lax",
  });
  const isLoading = ref<boolean>(false);
  const canResend = computed(() => coolDownTime.value === 0 && !isLoading.value);

  const rooms = computed<Room[]>(() => data.value?.rooms ?? []);

  const hostels = computed(() => data.value?.hostels ?? []);

  const hostelItem = computed<SelectMenuItem[]>(() =>
    hostels.value.map(h => ({ label: h.name, value: h.id })));

  let timer: ReturnType<typeof setInterval> | null = null;

  function startCoolDown(seconds: number) {
    if (timer)
      clearInterval(timer);

    coolDownTime.value = seconds;

    timer = setInterval(() => {
      if (coolDownTime.value > 0) {
        coolDownTime.value -= 1;
      }
      else {
        clearInterval(timer!);
        timer = null;
        coolDownTime.value = 0;
      }
    }, 1000);
  }

  if (import.meta.client) {
    onMounted(() => {
      if (coolDownTime.value! > 0) {
        // Restart only if there’s a cool down left
        startCoolDown(coolDownTime.value!);
      }
    });

    onBeforeUnmount(() => {
      if (timer)
        clearInterval(timer);
    });
  }

  async function handleRefresh(options: { force?: boolean } = {}): Promise<boolean> {
    const { force = false } = options;

    if (!canResend.value)
      return false;

    if (typeof refresh !== "function") {
      throw new TypeError("Refresh function is not available");
    }

    isLoading.value = true;

    // Prevent repeated refreshes while cool down is active unless forced
    if (!force && coolDownTime.value > 0) {
      isLoading.value = false;
      return false;
    }

    try {
      await refresh();
      startCoolDown(REFRESH_COOL_DOWN_SECONDS);
      return true;
    }
    catch (err) {
      // Log and rethrow so callers can handle errors
      console.error("[useFetchRoomData] refresh failed", err);
      throw err;
    }
    finally {
      isLoading.value = false;
    }
  }

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

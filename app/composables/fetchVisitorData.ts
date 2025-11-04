import type { Visitor } from "~~/server/db/queries/visitor";

import type { VisitorDataResponse } from "~/types";

const REFRESH_COOL_DOWN_SECONDS = 120;

export function useFetchVisitorData() {
  const { user } = useUserSession();

  const { data, status, refresh } = useFetch<VisitorDataResponse>("/api/visitor/getVisitorData", {
    method: "get",
    key: computed(() => `visitorData:${user.value?.adminData?.accessLevel}`),
    lazy: true,
    default: () => ({
      visitors: [],
      approved: 0,
      checkedIn: 0,
      pending: 0,
      totalVisitors: 0,
    }),
    getCachedData: (key, nuxtApp, ctx) => {
      if (ctx.cause === "refresh:manual" || ctx.cause === "refresh:hook")
        return undefined;
      return nuxtApp.payload.data[key] ?? nuxtApp.static.data[key];
    },
  });

  const visitors = computed<Visitor[]>(() => data.value?.visitors ?? []);

  const coolDownTime = useCookie<number>("visitorDataCoolDown", {
    default: () => 0,
    maxAge: 60 * 60 * 24 * 7,
    sameSite: "lax",
  });
  const isLoading = ref<boolean>(false);
  const canResend = computed(() => coolDownTime.value === 0 && !isLoading.value);

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
      console.error("[useFetchVisitorData] refresh failed", err);
      throw err;
    }
    finally {
      isLoading.value = false;
    }
  }

  return {
    data,
    visitors,
    status,
    canResend,
    isLoading,
    coolDownTime,
    handleRefresh,
    refresh,
  };
}

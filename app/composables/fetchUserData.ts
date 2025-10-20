import type { UserDataResponse, UserType } from "~/types";

const REFRESH_COOL_DOWN_SECONDS = 120;

export function useFetchUserData() {
  const { data, status, refresh } = useFetch<UserDataResponse>("/api/user/getUserData", {
    method: "get",
    key: "userData",
    lazy: true,
    cache: "force-cache",
    default: () => ({
      users: [],
      totalUsers: 0,
      totalStudents: 0,
      totalAdmins: 0,
      activeStudents: 0,
    }),
  });

  const users = computed<UserType[]>(() => data.value?.users ?? []);

  const coolDownTime = useCookie<number>("userDataCoolDown", {
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
      console.error("[useFetchRoomData] refresh failed", err);
      throw err;
    }
    finally {
      isLoading.value = false;
    }
  }

  return {
    data,
    status,
    refresh,
    users,
    canResend,
    isLoading,
    handleRefresh,
    coolDownTime,
  };
}

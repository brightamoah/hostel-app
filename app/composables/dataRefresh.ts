export function useDataRefresh(
  cacheName: string,
  context: string,
  refresh: Refresh,
) {
  const REFRESH_COOL_DOWN_SECONDS = 120;

  const coolDownEndTime = useCookie<number>(cacheName, {
    default: () => 0,
    maxAge: 60 * 60 * 24 * 7,
    sameSite: "lax",
  });

  const coolDownTime = ref<number>(0);

  const isLoading = ref<boolean>(false);
  const canResend = computed(() => coolDownTime.value <= 0 && !isLoading.value);

  let timer: ReturnType<typeof setInterval> | null = null;

  function updateCoolDown() {
    const now = Math.floor(Date.now() / 1000);
    const remaining = coolDownEndTime.value - now;
    coolDownTime.value = remaining > 0 ? remaining : 0;
    if (remaining <= 0 && timer) {
      clearInterval(timer);
      timer = null;
    }
  }

  function startCoolDown(seconds: number) {
    const now = Math.floor(Date.now() / 1000);
    coolDownEndTime.value = now + seconds;
    updateCoolDown();

    if (!timer) {
      timer = setInterval(updateCoolDown, 1000);
    }
  }

  if (import.meta.client) {
    onMounted(() => {
      updateCoolDown();

      if (coolDownTime.value > 0 && !timer) {
        timer = setInterval(updateCoolDown, 1000);
      }
    });

    onBeforeUnmount(() => {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    });
  }

  async function handleRefresh(options: { force?: boolean } = {}): Promise<boolean> {
    const { force = false } = options;

    if (!canResend.value) return false;

    if (typeof refresh !== "function") throw new TypeError("Refresh function is not available");

    isLoading.value = true;

    try {
      await refresh();
      if (!force) startCoolDown(REFRESH_COOL_DOWN_SECONDS);
      return true;
    }
    catch (err) {
      console.error(`${[context]} refresh failed`, err);
      throw err;
    }
    finally {
      isLoading.value = false;
    }
  }

  return {
    coolDownTime,
    isLoading,
    canResend,
    handleRefresh,
  };
}

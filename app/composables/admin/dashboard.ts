export function useAdminDashboardData() {
  const { user } = useUserSession();

  const { data, status, refresh } = useFetch<AdminDashboardData>("/api/admin/stats", {
    method: "GET",
    key: computed(() => `dashboardData:${user.value?.adminData?.accessLevel}`),
    lazy: true,
    cache: "default",
    getCachedData: (key, nuxtApp, ctx) => {
      if (ctx.cause === "refresh:manual" || ctx.cause === "refresh:hook") return undefined;
      return nuxtApp.payload.data[key] ?? nuxtApp.static.data[key];
    },
  });

  const cardStats = computed(() => data.value?.cardStats);
  const overview = computed(() => data.value?.overview);

  const {
    canResend,
    coolDownTime,
    isLoading,
    handleRefresh,
  } = useDataRefresh(
    "AdminDashboardDataCoolDown",
    "useAdminDashboardData",
    refresh,
  );

  return {
    data,
    cardStats,
    status,
    coolDownTime,
    isLoading,
    canResend,
    overview,
    refresh,
    handleRefresh,
  };
}

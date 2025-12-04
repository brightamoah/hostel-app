export function useFetchMaintenanceData() {
  const { user } = useUserSession();

  const { data, status, refresh } = useFetch<MaintenanceDataResponse>("/api/maintenance/getMaintenanceData", {
    method: "get",
    key: computed(() => `maintenanceData:${user.value?.adminData?.accessLevel}`),
    lazy: true,
    cache: "default",
    default: () => ({
      maintenanceRequests: [],
      totalMaintenance: 0,
      inProgress: 0,
      assigned: 0,
      pending: 0,
      completed: 0,
      rejected: 0,
    }),
    getCachedData: (key, nuxtApp, ctx) => {
      if (ctx.cause === "refresh:manual" || ctx.cause === "refresh:hook") return undefined;
      return nuxtApp.payload.data[key] ?? nuxtApp.static.data[key];
    },
  });

  const maintenanceRequests = computed<MaintenanceType[]>(() => data.value?.maintenanceRequests ?? []);

  const {
    canResend,
    coolDownTime,
    isLoading,
    handleRefresh,
  } = useDataRefresh(
    "maintenanceDataCoolDown",
    "useFetchMaintenanceData",
    refresh,
  );

  return {
    data,
    maintenanceRequests,
    status,
    isLoading,
    canResend,
    coolDownTime,
    handleRefresh,
  };
}

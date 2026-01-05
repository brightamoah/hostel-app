export function useFetchMaintenance() {
  const { user } = useUserSession();

  const {
    data,
    status,
    error,
    refresh,
  } = useCsrfFetch<MaintenanceDataResponse>("/api/maintenance/student/getMaintenanceData", {
    method: "GET",
    key: computed(() => `maintenanceData:${user.value?.id}`),
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
    "useFetchStudentMaintenanceData",
    refresh,
  );

  return {
    data,
    maintenanceRequests,
    status,
    isLoading,
    canResend,
    coolDownTime,
    error,
    handleRefresh,
    refresh,
  };
}

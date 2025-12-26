export function useFetchStudentVisitorData() {
  const { user } = useUserSession();

  const { data, status, refresh, error } = useFetch<VisitorDataResponse>("/api/student/getVisitors", {
    method: "get",
    key: computed(() => `visitorData:${user.value?.id}`),
    lazy: true,
    default: () => ({
      visitors: [],
      totalVisitors: 0,
      pending: 0,
      approved: 0,
      checkedIn: 0,
    }),
    getCachedData: (key, nuxtApp, ctx) => {
      if (ctx.cause === "refresh:manual" || ctx.cause === "refresh:hook") return undefined;
      return nuxtApp.payload.data[key] ?? nuxtApp.static.data[key];
    },
  });

  const visitors = computed<VisitorDataResponse["visitors"]>(() => data.value?.visitors ?? []);

  const {
    canResend,
    coolDownTime,
    isLoading,
    handleRefresh,
  } = useDataRefresh(
    "visitorDataCoolDown",
    "useFetchStudentVisitorData",
    refresh,
  );

  return {
    visitors,
    data,
    status,
    canResend,
    coolDownTime,
    isLoading,
    handleRefresh,
    refresh,
    error,
  };
}

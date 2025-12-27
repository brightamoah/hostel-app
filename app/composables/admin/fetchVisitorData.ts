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
    "useFetchVisitorData",
    refresh,
  );

  const getVisitorFromCache = (visitorId: number) => {
    return visitors.value.find(v => v.id === visitorId);
  };

  return {
    data,
    visitors,
    status,
    canResend,
    isLoading,
    coolDownTime,
    handleRefresh,
    refresh,
    getVisitorFromCache,
  };
}

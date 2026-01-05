export function useFetchComplaintData() {
  const { user } = useUserSession();

  const { data, status, refresh } = useCsrfFetch<ComplaintDataResponse>("/api/complaint/getComplaintData", {
    method: "get",
    key: computed(() => `complaintData:${user.value?.adminData?.accessLevel}`),
    lazy: true,
    default: () => ({
      complaints: [],
      totalComplaints: 0,
      totalInProgress: 0,
      totalPending: 0,
      totalResolved: 0,
    }),
    getCachedData: (key, nuxtApp, ctx) => {
      if (ctx.cause === "refresh:manual" || ctx.cause === "refresh:hook") return undefined;
      return nuxtApp.payload.data[key] ?? nuxtApp.static.data[key];
    },
  });

  const complaints = computed<Complaint[]>(() => data.value.complaints ?? []);

  const {
    canResend,
    coolDownTime,
    isLoading,
    handleRefresh,
  } = useDataRefresh(
    "complaintDataCoolDown",
    "useFetchComplaintData",
    refresh,
  );

  return {
    data,
    status,
    complaints,
    canResend,
    coolDownTime,
    isLoading,
    handleRefresh,
  };
}

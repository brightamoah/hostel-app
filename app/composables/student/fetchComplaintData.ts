export function useFetchStudentComplaintData() {
  const { user } = useUserSession();

  const { data, status, refresh, error } = useCsrfFetch<ComplaintDataResponse>("/api/complaint/student/getComplaints", {
    method: "get",
    key: computed(() => `complaintData:${user.value?.id}`),
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
    "useFetchStudentComplaintData",
    refresh,
  );

  return {
    data,
    status,
    complaints,
    canResend,
    coolDownTime,
    isLoading,
    error,
    handleRefresh,
    refresh,
  };
}

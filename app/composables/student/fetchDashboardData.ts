export function useFetchStudentDashboardData() {
  const { user } = useUserSession();

  const userId = computed(() => user.value?.id);

  const { data, status, refresh } = useFetch<DashboardStudent>(`/api/student/${userId.value}`, {
    method: "GET",
    key: computed(() => `dashboardData:${user.value?.id}`),
    lazy: true,
    cache: "default",
    default: () => ({
      student: {} as DashboardStudent["student"],
      totalBilled: 0,
      totalPaid: 0,
      balance: 0,
      totalVisitors: 0,
      pendingMaintenance: 0,
      rooms: [],
    }),
    getCachedData: (key, nuxtApp, ctx) => {
      if (ctx.cause === "refresh:manual" || ctx.cause === "refresh:hook") return undefined;
      return nuxtApp.payload.data[key] ?? nuxtApp.static.data[key];
    },
  });
  const student = computed<DashboardStudent["student"]>(() => data.value.student ?? {});

  const roomsInHostel = computed<RoomInHostel[]>(() => data.value.rooms ?? []);

  const {
    canResend,
    coolDownTime,
    isLoading,
    handleRefresh,
  } = useDataRefresh(
    "StudentDashboardDataCoolDown",
    "useFetchStudentDashboardData",
    refresh,
  );

  return {
    student,
    data,
    status,
    coolDownTime,
    isLoading,
    canResend,
    roomsInHostel,
    refresh,
    handleRefresh,
  };
}

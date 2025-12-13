export function useFetchUserData() {
  const { user } = useUserSession();

  const { data, status, refresh } = useFetch<UserDataResponse>("/api/user/getUserData", {
    method: "get",
    key: computed(() => `userData:${user.value?.adminData?.accessLevel}`),
    lazy: true,
    default: () => ({
      users: [],
      totalUsers: 0,
      totalStudents: 0,
      totalAdmins: 0,
      activeStudents: 0,
    }),
    getCachedData: (key, nuxtApp, ctx) => {
      if (ctx.cause === "refresh:manual" || ctx.cause === "refresh:hook") return undefined;
      return nuxtApp.payload.data[key] ?? nuxtApp.static.data[key];
    },
  });

  const users = computed<UserType[]>(() => data.value?.users ?? []);

  const {
    canResend,
    coolDownTime,
    isLoading,
    handleRefresh,
  } = useDataRefresh(
    "userDataCoolDown",
    "useFetchUserData",
    refresh,
  );

  return {
    data,
    status,
    users,
    canResend,
    isLoading,
    coolDownTime,
    handleRefresh,
    refresh,
  };
}

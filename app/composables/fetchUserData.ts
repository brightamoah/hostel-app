import type { UserDataResponse, UserType } from "~/types";

export function useFetchUserData() {
  const { data, status, refresh } = useFetch<UserDataResponse>("/api/user/getUserData", {
    method: "get",
    key: "userData",
    lazy: true,
    cache: "force-cache",
    default: () => ({
      users: [],
      totalUsers: 0,
      totalStudents: 0,
      totalAdmins: 0,
      activeStudents: 0,
    }),
  });

  const users = computed<UserType[]>(() => data.value?.users ?? []);

  return {
    data,
    status,
    refresh,
    users,
  };
}

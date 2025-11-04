import type { VisitorDataResponse } from "~/types";

export function useFetchVisitorData() {
  const { user } = useUserSession();

  const { data, status, refresh } = useFetch<VisitorDataResponse>("/api/visitor/getVisitorData", {
    method: "get",
    key: computed(() => `visitorData:${user.value?.adminData?.accessLevel}`),
    lazy: true,
  });

  const visitors = computed(() => data.value?.visitors ?? []);

  return {
    visitors,
    status,
    refresh,
  };
}

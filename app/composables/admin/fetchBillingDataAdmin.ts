export function useFetchBillingDataAdmin() {
  const { user } = useUserSession();
  const billingKey = computed(() => `bilingData: ${user.value?.adminData?.accessLevel}`);

  const { data, status, error, refresh } = useFetch<BillingResponse>("/api/billing/getBillings", {
    method: "GET",
    key: billingKey,
    lazy: true,
    cache: "default",
    default: () => ({
      billings: [],
      totalBillings: 0,
      totalPaid: 0,
      totalUnpaid: 0,
      totalPending: 0,
      totalOverdue: 0,
    }),
    getCachedData: (key, nuxtApp, ctx) => {
      if (ctx.cause === "refresh:manual" || ctx.cause === "refresh:hook") return undefined;
      return nuxtApp.payload.data[key] ?? nuxtApp.static.data[key];
    },
  });

  const billings = computed<Billing[]>(() => data.value.billings);

  const {
    canResend,
    coolDownTime,
    isLoading,
    handleRefresh,
  } = useDataRefresh(
    "billingDataCoolDown",
    "useFetchBillingDataAdmin",
    refresh,
  );

  return {
    data,
    billings,
    status,
    error,
    canResend,
    coolDownTime,
    isLoading,
    refresh,
    handleRefresh,
  };
}

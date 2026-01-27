import { getLocalTimeZone, today } from "@internationalized/date";
import { acceptHMRUpdate, defineStore } from "pinia";

const baseBilling: Partial<CreateBillingSchema> = {
  studentId: undefined,
  amount: undefined,
  type: undefined,
  academicPeriod: undefined,
  description: "",
  dueDate: undefined,
  paymentTerms: undefined,
  sendNotification: false,
};

export const useBillingStore = defineStore("billingStore", () => {
  const toast = useToast();
  const { $apiFetch } = useNuxtApp();

  const { user } = useUserSession();

  const isModalOpen = ref(false);

  const billingKey = computed(() => user.value?.role === "admin"
    ? `billingData:${user.value?.adminData?.accessLevel}`
    : `billingData:${user.value?.id}`);

  const createBillingState = ref<Partial<CreateBillingSchema>>(baseBilling);
  const isLoading = ref(false);

  watch(() => createBillingState.value.paymentTerms, (terms) => {
    if (!terms) return;

    const timezone = getLocalTimeZone();
    let date = today(timezone);

    switch (terms) {
      case "Net 15 Days":
        date = date.add({ days: 15 });
        break;
      case "Net 30 Days":
        date = date.add({ days: 30 });
        break;
      case "Net 45 Days":
        date = date.add({ days: 45 });
        break;
      case "Immediate Payment":
        date = date.add({ days: 1 });
        break;
    }
    createBillingState.value.dueDate = date;
  });

  const createBilling = async () => {
    isLoading.value = true;

    try {
      const response = await $apiFetch("/api/billing/create", {
        method: "POST",
        body: createBillingState.value,
      });

      await refreshNuxtData(billingKey.value);

      toast.add({
        title: response.message,
        description: `Billing record for student created successfully.`,
        color: "success",
        icon: "i-lucide-check-circle",
        duration: 5000,
      });

      isModalOpen.value = false;
      clearBillingState();
    }
    catch (error) {
      const message = (error as any)?.data?.message;
      toast.add({
        title: "Failed to Create Billing Record",
        description: message,
        color: "error",
        icon: "i-lucide-circle-alert",
        duration: 8000,
      });
    }
    finally {
      isLoading.value = false;
    }
  };

  function clearBillingState() {
    createBillingState.value = { ...baseBilling };
  }

  return {
    createBillingState,
    isLoading,
    isModalOpen,
    createBilling,
    clearBillingState,
  };
});

if (import.meta.hot) import.meta.hot.accept(acceptHMRUpdate(useBillingStore, import.meta.hot));

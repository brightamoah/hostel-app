import { acceptHMRUpdate, defineStore } from "pinia";

export const useMaintenanceStore = defineStore("maintenanceStore", () => {
  const { user } = useUserSession();

  const toast = useToast();

  const isLoading = ref<boolean>(false);
  const isModalOpen = ref<boolean>(false);
  const maintenanceDataKey = computed(() => `maintenanceData:${user.value?.adminData?.accessLevel}`);

  const maintenanceStatusResponseState = ref<StatusResponseForm>({
    responseText: "",
    status: "",
  });

  const isUpdateFormValid = computed(() => {
    return (
      maintenanceStatusResponseState.value.status.trim() !== ""
      && maintenanceStatusResponseState.value.responseText.trim() !== ""
    );
  });

  const isAddResponseFormValid = computed(() => {
    return (
      maintenanceStatusResponseState.value.responseText.trim() !== ""
    );
  });

  const updateStatusAndAddResponse = async (payload: MaintenanceStatusResponseSchema) => {
    if (!isUpdateFormValid.value) return;

    if (!payload.maintenanceId && !payload.status && !payload.responseText) return;

    if (payload.status === "") {
      toast.add({
        title: "Failed to Update Maintenance Status",
        description: "Status cannot be empty.",
        color: "error",
        icon: "i-lucide-circle-alert",
        duration: 8000,
      });
      return;
    }

    isLoading.value = true;

    try {
      const response = await $fetch("/api/maintenance/updateStatus", {
        method: "POST",
        body: payload,
      });

      toast.add({
        title: "Maintenance Status Updated Successfully",
        description: response.message,
        color: "success",
        icon: "i-lucide-check-circle",
      });

      await refreshNuxtData(maintenanceDataKey.value);
      clearState();
    }
    catch (error) {
      const message = (error as any)?.data?.message;
      toast.add({
        title: "Failed to Update Maintenance Status",
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

  const addMaintenanceResponse = async (payload: Omit<MaintenanceStatusResponseSchema, "status">) => {
    if (!isAddResponseFormValid.value) return;

    if (!payload.maintenanceId && !payload.responseText) return;

    isLoading.value = true;

    try {
      const response = await $fetch("/api/maintenance/addResponse", {
        method: "POST",
        body: payload,
      });

      toast.add({
        title: "Maintenance Response Added Successfully",
        description: response.message,
        color: "success",
        icon: "i-lucide-check-circle",
      });

      await refreshNuxtData(maintenanceDataKey.value);
      clearState();
    }
    catch (error) {
      const message = (error as any)?.data?.message;
      toast.add({
        title: "Failed to Add Maintenance Response",
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

  function clearState() {
    maintenanceStatusResponseState.value = {
      responseText: "",
      status: "",
    };
  };

  return {
    isLoading,
    isModalOpen,
    isUpdateFormValid,
    isAddResponseFormValid,
    maintenanceStatusResponseState,
    updateStatusAndAddResponse,
    addMaintenanceResponse,
    clearState,
  };
});

if (import.meta.hot) import.meta.hot.accept(acceptHMRUpdate(useMaintenanceStore, import.meta.hot));

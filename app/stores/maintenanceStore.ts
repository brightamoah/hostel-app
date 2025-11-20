import { acceptHMRUpdate, defineStore } from "pinia";

export const useMaintenanceStore = defineStore("maintenanceStore", () => {
  const maintenanceStatusResponseState = ref<StatusResponseForm>({
    responseText: "",
    status: "",
  });

  return {
    maintenanceStatusResponseState,
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useMaintenanceStore, import.meta.hot));
}

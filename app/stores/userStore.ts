import { acceptHMRUpdate, defineStore } from "pinia";

export const useUserStore = defineStore("userStore", () => {
  const deleteModalOpen = ref<boolean>(false);
  const isLoading = ref<boolean>(false);

  return {
    deleteModalOpen,
    isLoading,
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useUserStore, import.meta.hot));
}

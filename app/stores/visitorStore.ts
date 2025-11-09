import { acceptHMRUpdate, defineStore } from "pinia";

export const useVisitorStore = defineStore("visitorStore", () => {
  const isLoading = ref<boolean>(false);
  const deleteModalOpen = ref<boolean>(false);

  const deleteVisitors = async (payload: DeleteItemSchema) => {
    if (!payload.ids)
      // eslint-disable-next-line no-useless-return
      return;
  };
  return {
    isLoading,
    deleteModalOpen,
    deleteVisitors,
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useVisitorStore, import.meta.hot));
}

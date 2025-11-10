import { acceptHMRUpdate, defineStore } from "pinia";
import { capitalize } from "vue";

export const useVisitorStore = defineStore("visitorStore", () => {
  const { user } = useUserSession();
  const toast = useToast();
  const isLoading = ref<boolean>(false);
  const deleteModalOpen = ref<boolean>(false);

  const visitorDataKey = computed(() => `visitorData:${user.value?.adminData?.accessLevel}`);

  const deleteVisitors = async (payload: DeleteItemSchema) => {
    if (!payload.ids)
      // eslint-disable-next-line no-useless-return
      return;
  };

  const approveDenyVisitor = async (payload: ApproveDenySchema) => {
    if (!payload.visitorId && !payload.status)
      return;

    isLoading.value = true;

    try {
      const response = await $fetch("/api/visitor/approveDeny", {
        method: "PATCH",
        body: payload,
      });

      const status = capitalize(payload.status);
      toast.add({
        title: `Visitor ${status} Successfully`,
        description: response.message,
        color: "success",
        icon: "i-lucide-check-circle",
      });
      await refreshNuxtData(visitorDataKey.value);
    }
    catch (error) {
      const message = (error as any)?.data?.message;
      const status = capitalize(payload.status);
      toast.add({
        title: `Failed to ${status} Visitor`,
        description: message,
        color: "error",
        icon: "i-lucide-alert-circle",
        duration: 8000,
      });
    }
    finally {
      isLoading.value = false;
    }
  };

  return {
    isLoading,
    deleteModalOpen,
    deleteVisitors,
    approveDenyVisitor,
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useVisitorStore, import.meta.hot));
}

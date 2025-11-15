import { acceptHMRUpdate, defineStore } from "pinia";
import { capitalize } from "vue";

export const useVisitorStore = defineStore("visitorStore", () => {
  const { user } = useUserSession();
  const toast = useToast();
  const isLoading = ref<boolean>(false);
  const deleteModalOpen = ref<boolean>(false);

  const visitorDataKey = computed(() => `visitorData:${user.value?.adminData?.accessLevel}`);

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

  const checkInCheckOutVisitor = async (payload: LogActionSchema) => {
    if (!payload.visitorId && !payload.action)
      return;

    isLoading.value = true;

    try {
      const response = await $fetch("/api/visitor/checkInCheckout", {
        method: "POST",
        body: payload,
      });

      const action = payload.action === "check_in" ? "Checked In" : "Checked Out";
      toast.add({
        title: `Visitor ${action} Successfully`,
        description: response.message,
        color: "success",
        icon: "i-lucide-check-circle",
      });
      await refreshNuxtData(visitorDataKey.value);
    }
    catch (error) {
      const message = (error as any)?.data?.message;
      const action = payload.action === "check_in" ? "Check In" : "Check Out";
      toast.add({
        title: `Failed to ${action} Visitor`,
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

  const deleteVisitors = async (payload: DeleteItemSchema) => {
    if (!payload.ids)
      return;

    isLoading.value = true;

    try {
      const response = await $fetch("/api/visitor/deleteVisitorAdmin", {
        method: "DELETE",
        body: payload,
      });

      toast.add({
        title: response.message,
        description: "The visitor(s) has been deleted successfully.",
        color: "success",
        icon: "i-lucide-check-circle",
      });
      await refreshNuxtData(visitorDataKey.value);
    }
    catch (error) {
      const message = (error as any)?.data?.message;
      toast.add({
        title: "Failed to Delete Visitor(s)",
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
    checkInCheckOutVisitor,
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useVisitorStore, import.meta.hot));
}

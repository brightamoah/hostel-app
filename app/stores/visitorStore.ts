import type { FormSubmitEvent } from "@nuxt/ui";

import { acceptHMRUpdate, defineStore } from "pinia";
import { capitalize } from "vue";

export const useVisitorStore = defineStore("visitorStore", () => {
  const { user } = useUserSession();
  const toast = useToast();
  const isLoading = ref<boolean>(false);
  const deleteModalOpen = ref<boolean>(false);

  const visitorDataKey = computed(() =>
    user.value?.role === "admin"
      ? `visitorData:${user.value?.adminData?.accessLevel}`
      : `visitorData:${user.value?.id}`,
  );

  const approveDenyVisitor = async (payload: ApproveDenySchema) => {
    if (!payload.visitorId && !payload.status) return;

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
    if (!payload.visitorId && !payload.action) return;

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
    if (!payload.ids) return;

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

  const registerVisitorState = ref<CreateVisitor>({
    name: "",
    email: "",
    phoneNumber: "",
    relationship: "",
    visitDate: undefined,
    purpose: "",
  });

  const submitVisitorForm = async (payload: FormSubmitEvent<CreateVisitor>) => {
    if (!payload?.data) return;

    isLoading.value = true;
    try {
      const response = await $fetch("/api/visitor/register", {
        method: "POST",
        body: payload.data,
      });

      toast.add({
        title: response.message,
        description: "Your visitor has been registered successfully.",
        color: "success",
        icon: "i-lucide-check-circle",
      });

      await refreshNuxtData();
    }
    catch (error) {
      const message = (error as any)?.data?.message;
      toast.add({
        title: "Failed to Register Visitor",
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

  const clearState = () => {
    registerVisitorState.value = {
      name: "",
      email: "",
      phoneNumber: "",
      relationship: "",
      visitDate: undefined,
      purpose: "",
    };
  };

  return {
    isLoading,
    deleteModalOpen,
    registerVisitorState,
    deleteVisitors,
    approveDenyVisitor,
    checkInCheckOutVisitor,
    submitVisitorForm,
    clearState,
  };
});

if (import.meta.hot) import.meta.hot.accept(acceptHMRUpdate(useVisitorStore, import.meta.hot));

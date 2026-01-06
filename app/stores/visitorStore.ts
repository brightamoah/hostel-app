import type { FormErrorEvent, FormSubmitEvent } from "@nuxt/ui";

import { parseDate } from "@internationalized/date";
import { acceptHMRUpdate, defineStore } from "pinia";
import { capitalize } from "vue";

export const useVisitorStore = defineStore("visitorStore", () => {
  const { user } = useUserSession();
  const { $apiFetch } = useNuxtApp();

  const toast = useToast();
  const isLoading = ref<boolean>(false);
  const deleteModalOpen = ref<boolean>(false);

  const visitorDataKey = computed(() =>
    user.value?.role === "admin"
      ? `visitorData:${user.value?.adminData?.accessLevel}`
      : `visitorData:${user.value?.id}`,
  );

  const dashboardKey = computed(() => `dashboardData:${user.value?.id}`);

  const approveDenyVisitor = async (payload: ApproveDenySchema) => {
    if (!payload.visitorId && !payload.status) return;

    isLoading.value = true;

    try {
      const response = await $apiFetch("/api/visitor/approveDeny", {
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
        icon: "i-lucide-circle-alert",
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
      const response = await $apiFetch("/api/visitor/checkInCheckout", {
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
        icon: "i-lucide-circle-alert",
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
      const response = await $apiFetch("/api/visitor/deleteVisitorAdmin", {
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
        icon: "i-lucide-circle-alert",
        duration: 8000,
      });
    }
    finally {
      isLoading.value = false;
    }
  };

  const isModalOpen = ref<boolean>(false);

  const registerVisitorState = ref<CreateVisitor>({
    name: "",
    email: "",
    phoneNumber: "",
    relationship: "",
    visitDate: undefined,
    purpose: "",
  });

  const registerVisitor = async (payload: FormSubmitEvent<CreateVisitor>) => {
    if (!payload?.data) return;

    isLoading.value = true;
    try {
      const response = await $apiFetch("/api/visitor/register", {
        method: "POST",
        body: payload.data,
      });

      await refreshNuxtData(visitorDataKey.value);
      await refreshNuxtData(dashboardKey.value);

      toast.add({
        title: response.message,
        description: "Your visitor has been registered successfully.",
        color: "success",
        icon: "i-lucide-check-circle",
      });

      isModalOpen.value = false;
      clearState();
    }
    catch (error) {
      const message = (error as any)?.data?.message;
      toast.add({
        title: "Failed to Register Visitor",
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

  const editingId = ref<number | null>(null);
  const originalEditState = ref<EditVisitor["data"] | null>(null);

  const editVisitorState = ref<EditVisitor["data"]>({
    name: "",
    visitDate: undefined,
    email: "",
    phoneNumber: "",
    relationship: "",
    purpose: "",
  });

  const isEditFormValid = computed(() => {
    const { email, name, phoneNumber, purpose, visitDate, relationship } = editVisitorState.value;

    return (
      (email?.trim() ?? "") !== ""
      && (name?.trim() ?? "") !== ""
      && (phoneNumber?.trim() ?? "") !== ""
      && (purpose?.trim() ?? "") !== ""
      && (relationship?.trim() ?? "") !== ""
      && visitDate !== undefined
    );
  });

  const hasNoChanges = computed(() => {
    if (!originalEditState.value) return false;

    return isDeepEqual(editVisitorState.value, originalEditState.value);
  });

  function initEditSession(visitor: VisitorType) {
    editingId.value = visitor.id;

    let visitDate;
    try {
      visitDate = parseDate(visitor.visitDate);
    }
    catch {
      console.error("Invalid visitDate format:", visitor.visitDate);
      visitDate = undefined;
    }

    const mappedState: EditVisitor["data"] = {
      name: visitor.name,
      visitDate,
      email: visitor.email,
      phoneNumber: visitor.phoneNumber,
      relationship: visitor.relationship,
      purpose: visitor.purpose,
    };

    editVisitorState.value = { ...mappedState };
    originalEditState.value = { ...mappedState };
  }

  async function editVisitor() {
    if (!isEditFormValid.value || !editingId.value) return;

    if (hasNoChanges.value) {
      toast.add({
        title: "No Changes Detected",
        description: "Please make changes to the form before submitting.",
        color: "warning",
        icon: "i-lucide-triangle-alert",
      });
      return;
    }

    const changes: Partial<EditVisitor["data"]> = {};
    const current = editVisitorState.value;
    const original = originalEditState.value!;

    for (const key in current) {
      const k = key as keyof EditVisitor["data"];
      if (!isDeepEqual(current[k], original[k])) {
        // @ts-expect-error - Typescript gets strict about partial assignments, but this is safe
        changes[k] = current[k];
      }
    }

    const payload: EditVisitor = {
      visitorId: editingId.value,
      data: changes,
    };

    isLoading.value = true;

    try {
      const response = await $apiFetch(`/api/visitor/${payload.visitorId}`, {
        method: "PATCH",
        body: payload,
      });

      await refreshNuxtData(visitorDataKey.value);
      await refreshNuxtData(dashboardKey.value);

      toast.add({
        title: "Visitor Updated Successfully",
        description: response.message,
        color: "success",
        icon: "i-lucide-check-circle",
      });

      editingId.value = null;
      originalEditState.value = null;

      clearState();
    }
    catch (error) {
      const message = (error as any)?.data?.message;

      toast.add({
        title: `Failed to update visitor with id: ${payload.visitorId}`,
        description: message,
        color: "error",
        icon: "i-lucide-circle-alert",
        duration: 8000,
      });
    }
    finally {
      isLoading.value = false;
    }
  }

  const handleFormError = (event: FormErrorEvent) => {
    const messages = event.errors.map(e => e.message).join(", ");
    toast.add({
      title: "Form Validation Error",
      description: messages,
      color: "error",
      icon: "i-lucide-circle-alert",
    });
  };

  function clearState() {
    registerVisitorState.value = {
      name: "",
      email: "",
      phoneNumber: "",
      relationship: "",
      visitDate: undefined,
      purpose: "",
    };

    editVisitorState.value = {
      name: "",
      visitDate: undefined,
      email: "",
      phoneNumber: "",
      relationship: "",
      purpose: "",
    };
  };

  return {
    isLoading,
    deleteModalOpen,
    registerVisitorState,
    isModalOpen,
    editingId,
    originalEditState,
    editVisitorState,
    isEditFormValid,
    hasNoChanges,
    deleteVisitors,
    approveDenyVisitor,
    checkInCheckOutVisitor,
    registerVisitor,
    clearState,
    initEditSession,
    editVisitor,
    handleFormError,
  };
});

if (import.meta.hot) import.meta.hot.accept(acceptHMRUpdate(useVisitorStore, import.meta.hot));

import type { FormErrorEvent } from "@nuxt/ui";

import { acceptHMRUpdate, defineStore } from "pinia";

export const useComplaintStore = defineStore("complaintStore", () => {
  const { user } = useUserSession();

  const toast = useToast();

  const isLoading = ref<boolean>(false);
  const isModalOpen = ref<boolean>(false);
  const complaintDataKey = computed(() => `complaintData:${user.value?.adminData?.accessLevel}`);

  const complaintStatusResponseState = ref<ComplaintStatusForm>({
    responseText: "",
    status: "",
  });

  const isUpdateFormValid = computed(() => {
    return (
      complaintStatusResponseState.value.status.trim() !== ""
      && complaintStatusResponseState.value.responseText.trim() !== ""
    );
  });

  const isAddResponseFormValid = computed(() => {
    return (
      complaintStatusResponseState.value.responseText.trim() !== ""
    );
  });

  const updateStatusAndAddResponse = async (payload: ComplaintStatusResponseSchema) => {
    if (!isUpdateFormValid.value) return;

    if (!payload.complaintId && !payload.status && !payload.responseText) return;

    if (payload.status === "") {
      toast.add({
        title: "Failed to Update Complaint Status",
        description: "Status cannot be empty.",
        color: "error",
        icon: "i-lucide-circle-alert",
        duration: 8000,
      });
      return;
    }

    isLoading.value = true;

    try {
      const response = await $fetch("/api/complaint/updateStatus", {
        method: "POST",
        body: payload,
      });

      toast.add({
        title: "Complaint Status Updated Successfully",
        description: response.message,
        color: "success",
        icon: "i-lucide-check-circle",
      });

      await refreshNuxtData(complaintDataKey.value);
      clearState();
    }
    catch (error) {
      const message = (error as any)?.data?.message;
      toast.add({
        title: "Failed to Update Complaint Status",
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

  const addComplaintResponse = async (payload: Omit<ComplaintStatusResponseSchema, "status">) => {
    if (!isAddResponseFormValid.value) return;

    if (!payload.complaintId && !payload.responseText) return;

    isLoading.value = true;

    try {
      const response = await $fetch("/api/complaint/addResponse", {
        method: "POST",
        body: payload,
      });

      toast.add({
        title: "Complaint Response Added Successfully",
        description: response.message,
        color: "success",
        icon: "i-lucide-check-circle",
      });

      await refreshNuxtData(complaintDataKey.value);
      clearState();
    }
    catch (error) {
      const message = (error as any)?.data?.message;
      toast.add({
        title: "Failed to Add Complaint Response",
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

  const isCreateModalOpen = ref(false);

  const createComplaintState = ref<Partial<ComplaintInsert>>({
    type: undefined,
    description: "",
    priority: undefined,
    hostelId: undefined,
    studentId: undefined,
    roomId: undefined,
  });

  function clearState() {
    complaintStatusResponseState.value = {
      responseText: "",
      status: "",
    };

    createComplaintState.value = {
      type: undefined,
      description: "",
      priority: undefined,
      hostelId: undefined,
      studentId: undefined,
      roomId: undefined,
    };
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

  return {
    isLoading,
    isModalOpen,
    complaintStatusResponseState,
    isUpdateFormValid,
    isAddResponseFormValid,
    isCreateModalOpen,
    createComplaintState,
    updateStatusAndAddResponse,
    addComplaintResponse,
    clearState,
    handleFormError,
  };
});

if (import.meta.hot) import.meta.hot.accept(acceptHMRUpdate(useComplaintStore, import.meta.hot));

import type { FormErrorEvent, FormSubmitEvent } from "@nuxt/ui";

import { acceptHMRUpdate, defineStore } from "pinia";

export const useComplaintStore = defineStore("complaintStore", () => {
  const { user } = useUserSession();

  const toast = useToast();

  const isLoading = ref<boolean>(false);
  const isModalOpen = ref<boolean>(false);
  const complaintDataKey = computed(() => {
    if (user.value?.role === "admin") {
      const accessLevel = user.value?.adminData?.accessLevel;
      if (!accessLevel) {
        console.warn("Admin user missing accessLevel");
        return `complaintData:admin-default`;
      }
      return `complaintData:${accessLevel}`;
    }
    const userId = user.value?.id;
    if (!userId) {
      console.warn("User missing id");
      return `complaintData:user-default`;
    }
    return `complaintData:${userId}`;
  });

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

  const isCreateFormValid = computed(() => {
    return (
      createComplaintState.value.type?.trim() !== ""
      && createComplaintState.value.type !== undefined
      && createComplaintState.value.description?.trim() !== ""
      && createComplaintState.value.priority?.trim() !== ""
      && createComplaintState.value.priority !== undefined
      && createComplaintState.value.hostelId !== undefined
      && createComplaintState.value.studentId !== undefined
    );
  });

  const createComplaint = async (payload: FormSubmitEvent<CreateComplaintSchema>): Promise<void> => {
    if (!isCreateFormValid.value) return;

    isLoading.value = true;

    try {
      const response = await $fetch("/api/complaint/student/createComplaint", {
        method: "POST",
        body: payload.data,
      });

      await refreshNuxtData(complaintDataKey.value);

      toast.add({
        title: "Success",
        description: response.message,
        color: "success",
        icon: "i-lucide-check-circle",
      });

      isCreateModalOpen.value = false;
      clearState();
    }
    catch (error) {
      const message = (error as any)?.data?.message;
      toast.add({
        title: "Failed to Create Complaint",
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
    createComplaint,
  };
});

if (import.meta.hot) import.meta.hot.accept(acceptHMRUpdate(useComplaintStore, import.meta.hot));

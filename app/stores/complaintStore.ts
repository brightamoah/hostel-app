import type { FormErrorEvent, FormSubmitEvent } from "@nuxt/ui";

import { acceptHMRUpdate, defineStore } from "pinia";

const baseComplaint: Partial<ComplaintInsert> = {
  type: undefined,
  description: "",
  priority: undefined,
  hostelId: undefined,
  studentId: undefined,
  roomId: undefined,
};

export const useComplaintStore = defineStore("complaintStore", () => {
  const { user } = useUserSession();
  const { $apiFetch } = useNuxtApp();

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

  const postComplaintResponse = async (payload: { complaintId: number; responseText: string }) => {
    return await $apiFetch("/api/complaint/addResponse", {
      method: "POST",
      body: payload,
    });
  };

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
      const response = await $apiFetch("/api/complaint/updateStatus", {
        method: "POST",
        body: payload,
      });

      toast.add({
        title: "Complaint Status Updated Successfully",
        description: response.message,
        color: "success",
        icon: "i-lucide-circle-check-big",
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
      const response = await postComplaintResponse(payload as { complaintId: number; responseText: string });

      toast.add({
        title: "Complaint Response Added Successfully",
        description: response.message,
        color: "success",
        icon: "i-lucide-circle-check-big",
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

  const createComplaintState = ref<Partial<ComplaintInsert>>(baseComplaint);

  const validateComplaintForm = (state: Partial<ComplaintInsert>) => {
    return (
      state.type?.trim() !== ""
      && state.type !== undefined
      && state.description?.trim() !== ""
      && state.priority?.trim() !== ""
      && state.priority !== undefined
      && state.hostelId !== undefined
      && state.studentId !== undefined
    );
  };

  const isCreateFormValid = computed(() => validateComplaintForm(createComplaintState.value));

  const createComplaint = async (payload: FormSubmitEvent<CreateComplaintSchema>): Promise<void> => {
    if (!isCreateFormValid.value) return;

    isLoading.value = true;

    try {
      const response = await $apiFetch("/api/complaint/student/createComplaint", {
        method: "POST",
        body: payload.data,
      });

      await refreshNuxtData(complaintDataKey.value);

      toast.add({
        title: "Success",
        description: response.message,
        color: "success",
        icon: "i-lucide-circle-check-big",
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

  const editingId = ref<number | null>(null);
  const originalEditState = ref<Partial<ComplaintInsert> | null>(null);

  const editComplaintState = ref<Partial<ComplaintInsert>>(baseComplaint);

  const hasNoChanges = computed(() => {
    if (!originalEditState.value) return false;

    return isDeepEqual(editComplaintState.value, originalEditState.value);
  });

  const initEditSession = (complaint: Complaint) => {
    editingId.value = complaint.id;

    const mappedState: Partial<ComplaintInsert> = {
      type: complaint.type,
      description: complaint.description,
      priority: complaint.priority,
      hostelId: complaint.hostelId,
      studentId: complaint.studentId,
      roomId: complaint.roomId ?? undefined,
    };

    originalEditState.value = structuredClone(mappedState);
    editComplaintState.value = structuredClone(mappedState);
  };

  const isEditFormValid = computed(() => validateComplaintForm(editComplaintState.value));

  const getPayloadForEdit = (): EditComplaint => {
    const changes: Partial<ComplaintInsert> = {};
    const current = editComplaintState.value;
    const original = originalEditState.value!;

    for (const key in current) {
      const k = key as keyof ComplaintInsert;
      if (isDeepEqual(current[k], original[k])) continue;

      if (current[k] === undefined) {
        // @ts-expect-error -- need is needed to clear DB field
        changes[k] = null;
      }
      else {
        // @ts-expect-error - Typescript gets strict about partial assignments, but this is safe
        changes[k] = current[k];
      };
    }

    if (!editingId.value) throw new Error("Cannot build edit payload: editingId is null");

    const payload = {
      complaintId: editingId.value,
      studentId: current.studentId!,
      data: changes,
    } satisfies EditComplaint;

    return payload;
  };

  const editComplaint = async (): Promise<void> => {
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
    const payload = getPayloadForEdit();

    isLoading.value = true;

    try {
      const response = await $apiFetch(`/api/complaint/student/${payload.complaintId}`, {
        method: "PATCH",
        body: payload,
      });

      await refreshNuxtData(complaintDataKey.value);

      toast.add({
        title: "Success",
        description: response.message,
        color: "success",
        icon: "i-lucide-circle-check-big",
      });

      clearState();
    }
    catch (error) {
      const message = (error as any)?.data?.message;
      toast.add({
        title: "Failed to Edit Complaint",
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

  const followUpState = ref<ComplaintFollowUp>({
    complaintId: undefined,
    responseText: "",
  });

  const initFollowUpSession = (complaint: Complaint) => {
    followUpState.value.complaintId = complaint.id;
    followUpState.value.responseText = "";
  };

  const isFollowUpFormValid = computed(() => (
    followUpState.value.responseText?.trim() !== ""
    && followUpState.value.complaintId !== undefined
  ));

  const submitFollowUp = async (): Promise<boolean> => {
    if (!isFollowUpFormValid.value) return false;

    isLoading.value = true;

    try {
      const response = await postComplaintResponse({
        complaintId: followUpState.value.complaintId!,
        responseText: followUpState.value.responseText!,
      });

      await refreshNuxtData(complaintDataKey.value);

      toast.add({
        title: "Complaint Response Added Successfully",
        description: response.message,
        color: "success",
        icon: "i-lucide-circle-check-big",
      });

      clearState();

      return true;
    }
    catch (error) {
      const message = (error as any)?.data?.message;
      toast.add({
        title: "Failed to Submit Follow Up",
        description: message,
        color: "error",
        icon: "i-lucide-circle-alert",
        duration: 8000,
      });
      return false;
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

    editingId.value = null;
    originalEditState.value = null;

    editComplaintState.value = structuredClone(baseComplaint);

    createComplaintState.value = structuredClone(baseComplaint);

    followUpState.value = {
      complaintId: undefined,
      responseText: "",
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
    editComplaintState,
    editingId,
    followUpState,
    isFollowUpFormValid,
    updateStatusAndAddResponse,
    addComplaintResponse,
    clearState,
    handleFormError,
    createComplaint,
    initEditSession,
    initFollowUpSession,
    editComplaint,
    submitFollowUp,
  };
});

if (import.meta.hot) import.meta.hot.accept(acceptHMRUpdate(useComplaintStore, import.meta.hot));

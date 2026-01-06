import type { FormErrorEvent } from "@nuxt/ui";

import { acceptHMRUpdate, defineStore } from "pinia";

export const useMaintenanceStore = defineStore("maintenanceStore", () => {
  const { user } = useUserSession();
  const { $apiFetch } = useNuxtApp();

  const toast = useToast();

  const isLoading = ref<boolean>(false);
  const isModalOpen = ref<boolean>(false);

  const maintenanceDataKey = computed(() => user.value?.role === "admin"
    ? `maintenanceData:${user.value?.adminData?.accessLevel}`
    : `maintenanceData:${user.value?.id}`,
  );

  const dashboardKey = computed(() => `dashboardData:${user.value?.id}`);

  const maintenanceStatusResponseState = ref<StatusResponseForm>({
    responseText: "",
    status: "",
  });

  const isUpdateFormValid = computed(() => {
    return (
      maintenanceStatusResponseState.value.status.trim() !== ""
      && maintenanceStatusResponseState.value.responseText.trim() !== ""
    );
  });

  const isAddResponseFormValid = computed(() => {
    return (
      maintenanceStatusResponseState.value.responseText.trim() !== ""
    );
  });

  const updateStatusAndAddResponse = async (payload: MaintenanceStatusResponseSchema) => {
    if (!isUpdateFormValid.value) return;

    if (!payload.maintenanceId && !payload.status && !payload.responseText) return;

    if (payload.status === "") {
      toast.add({
        title: "Failed to Update Maintenance Status",
        description: "Status cannot be empty.",
        color: "error",
        icon: "i-lucide-circle-alert",
        duration: 8000,
      });
      return;
    }

    isLoading.value = true;

    try {
      const response = await $apiFetch("/api/maintenance/updateStatus", {
        method: "POST",
        body: payload,
      });

      toast.add({
        title: "Maintenance Status Updated Successfully",
        description: response.message,
        color: "success",
        icon: "i-lucide-check-circle",
      });

      await refreshNuxtData(maintenanceDataKey.value);
      clearState();
    }
    catch (error) {
      const message = (error as any)?.data?.message;
      toast.add({
        title: "Failed to Update Maintenance Status",
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

  const addMaintenanceResponse = async (payload: Omit<MaintenanceStatusResponseSchema, "status">) => {
    if (!isAddResponseFormValid.value) return;

    if (!payload.maintenanceId && !payload.responseText) return;

    isLoading.value = true;

    try {
      const response = await $apiFetch("/api/maintenance/addResponse", {
        method: "POST",
        body: payload,
      });

      toast.add({
        title: "Maintenance Response Added Successfully",
        description: response.message,
        color: "success",
        icon: "i-lucide-check-circle",
      });

      await refreshNuxtData(maintenanceDataKey.value);
      clearState();
    }
    catch (error) {
      const message = (error as any)?.data?.message;
      toast.add({
        title: "Failed to Add Maintenance Response",
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
  const createMaintenanceState = ref<Partial<CreateMaintenanceSchema>>({
    issueType: undefined,
    description: "",
    priority: undefined,
    hostelId: undefined,
    studentId: undefined,
    roomId: undefined,
  });

  const isCreateFormValid = computed(() => {
    return (
      createMaintenanceState.value.issueType?.trim() !== ""
      && createMaintenanceState.value.description?.trim() !== ""
      && createMaintenanceState.value.priority?.trim() !== ""
      && createMaintenanceState.value.hostelId !== undefined
      && createMaintenanceState.value.studentId !== undefined
      && createMaintenanceState.value.roomId !== undefined
    );
  });

  const createMaintenance = async () => {
    if (!isCreateFormValid.value) return;

    isLoading.value = true;

    try {
      const response = await $apiFetch("/api/maintenance/student/createRequest", {
        method: "POST",
        body: createMaintenanceState.value,
      });

      await refreshNuxtData(maintenanceDataKey.value);
      await refreshNuxtData(dashboardKey.value);

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
        title: "Failed to Create Maintenance",
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
  const originalEditState = ref<MaintenanceEdit["data"] | null>(null);

  const editMaintenanceState = ref<MaintenanceEdit["data"]>({
    issueType: undefined,
    description: "",
    priority: undefined,
    hostelId: undefined,
    studentId: undefined,
    roomId: undefined,
  });

  const isEditFormValid = computed(() => {
    const { issueType, description, priority, hostelId, studentId, roomId } = editMaintenanceState.value;

    return (
      (issueType?.trim() ?? "") !== ""
      && description?.trim() !== ""
      && (priority?.trim() ?? "") !== ""
      && hostelId !== undefined
      && studentId !== undefined
      && roomId !== undefined
    );
  });

  const hasNoChanges = computed(() => {
    if (!originalEditState.value) return false;

    return isDeepEqual(editMaintenanceState.value, originalEditState.value);
  });

  const initEditSession = (maintenance: MaintenanceType) => {
    editingId.value = maintenance.id;

    const mappedState: MaintenanceEdit["data"] = {
      issueType: maintenance.issueType,
      description: maintenance.description,
      priority: maintenance.priority,
      hostelId: maintenance.hostelId,
      studentId: maintenance.studentId,
      roomId: maintenance.roomId,
    };

    originalEditState.value = structuredClone(mappedState);
    editMaintenanceState.value = structuredClone(mappedState);
  };

  const editMaintenance = async () => {
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

    const changes: Partial<MaintenanceEdit["data"]> = {};
    const current = editMaintenanceState.value;
    const original = originalEditState.value!;

    for (const key in current) {
      const k = key as keyof MaintenanceEdit["data"];
      if (!isDeepEqual(current[k], original[k])) {
        // @ts-expect-error - Typescript gets strict about partial assignments, but this is safe
        changes[k] = current[k];
      }
    }

    const payload = {
      maintenanceId: editingId.value,
      studentId: current.studentId!,
      data: changes,
    } satisfies MaintenanceEdit;

    isLoading.value = true;

    try {
      const response = await $apiFetch(`/api/maintenance/student/${payload.maintenanceId}`, {
        method: "PATCH",
        body: payload,
      });

      await refreshNuxtData(maintenanceDataKey.value);
      await refreshNuxtData(dashboardKey.value);

      toast.add({
        title: "Maintenance Edited Successfully",
        description: response.message,
        color: "success",
        icon: "i-lucide-check-circle",
      });

      clearState();
    }
    catch (error) {
      const message = (error as any)?.data?.message;
      toast.add({
        title: "Failed to Edit Maintenance",
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
    maintenanceStatusResponseState.value = {
      responseText: "",
      status: "",
    };

    createMaintenanceState.value = {
      issueType: "",
      description: "",
      priority: "",
      hostelId: undefined,
      studentId: undefined,
      roomId: undefined,
    };

    editingId.value = null;
    originalEditState.value = null;
    editMaintenanceState.value = {
      issueType: undefined,
      description: "",
      priority: undefined,
      hostelId: undefined,
      studentId: undefined,
      roomId: undefined,
    };
  };

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
    isUpdateFormValid,
    isAddResponseFormValid,
    maintenanceStatusResponseState,
    createMaintenanceState,
    isCreateModalOpen,
    editMaintenanceState,
    editingId,
    updateStatusAndAddResponse,
    addMaintenanceResponse,
    clearState,
    createMaintenance,
    initEditSession,
    editMaintenance,
    handleFormError,
  };
});

if (import.meta.hot) import.meta.hot.accept(acceptHMRUpdate(useMaintenanceStore, import.meta.hot));

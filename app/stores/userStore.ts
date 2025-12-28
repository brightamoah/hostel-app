import type { FormSubmitEvent } from "@nuxt/ui";

import { acceptHMRUpdate, defineStore } from "pinia";

export const useUserStore = defineStore("userStore", () => {
  const toast = useToast();
  const addModalOpen = ref<boolean>(false);
  const isLoading = ref<boolean>(false);
  const { user } = useUserSession();

  const userDataKey = computed(() => `userData:${user.value?.adminData?.accessLevel}`);

  const adminState = ref<AddAdminSchema>({
    name: "",
    email: "",
    role: "admin",
    phoneNumber: "",
    accessLevel: "regular",
    department: "",
    hostelId: null,
  });

  const isFormValid = computed(() => {
    return (
      adminState.value.name.trim() !== ""
      && adminState.value.email.trim() !== ""
      && adminState.value.phoneNumber.trim() !== ""
      && adminState.value.role.trim() !== ""
      && adminState.value.accessLevel.trim() !== ""
      && adminState.value.department.trim() !== ""
      && (adminState.value.hostelId === null || (adminState.value.hostelId && adminState.value.hostelId > 0))
    );
  });

  const addNewAdmin = async (payload: FormSubmitEvent<AddAdminSchema>) => {
    if (!isFormValid.value) return;

    isLoading.value = true;
    try {
      const response = await $fetch("/api/user/addNewAdmin", {
        method: "POST",
        body: payload.data,
      });

      await refreshNuxtData(userDataKey.value);

      toast.add({
        title: "Admin Added Successfully",
        description: response.message,
        color: "success",
        icon: "i-lucide-check-circle",
      });

      addModalOpen.value = false;
      resetAddAdminState();
    }
    catch (error) {
      console.error("Error adding new admin:", error);
      const message = (error as any)?.data?.message;
      toast.add({
        title: "Failed to Add Admin",
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

  const deleteModalOpen = ref<boolean>(false);

  const deleteUser = async (payload: DeleteItemSchema) => {
    if (!payload.ids) return;

    isLoading.value = true;

    try {
      const response = await $fetch("/api/user/deleteUser", {
        method: "DELETE",
        body: payload,
      });

      toast.add({
        title: response.message,
        description: "The user(s) has been deleted successfully.",
        color: "success",
        icon: "i-lucide-check-circle",
      });
      await refreshNuxtData(userDataKey.value);
    }
    catch (error) {
      const message = (error as any)?.data?.message;
      toast.add({
        title: "Failed to Delete User(s)",
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

  const promoteOrDemoteUser = async (payload: PromoteDemoteSchema) => {
    if (!payload.userId) return;

    isLoading.value = true;

    try {
      const response = await $fetch("/api/user/promoteDemote", {
        method: "PATCH",
        body: payload,
      });

      toast.add({
        title: "User Role Updated Successfully",
        description: response.message,
        color: "success",
        icon: "i-lucide-check-circle",
      });

      await refreshNuxtData(userDataKey.value);
    }
    catch (error) {
      const message = (error as any)?.data?.message;
      toast.add({
        title: "Failed to Update User Role",
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

  function resetAddAdminState() {
    adminState.value = {
      name: "",
      email: "",
      role: "admin",
      phoneNumber: "",
      accessLevel: "regular",
      department: "",
      hostelId: null,
    };
  }

  return {
    isLoading,
    adminState,
    isFormValid,
    addModalOpen,
    deleteModalOpen,
    addNewAdmin,
    resetAddAdminState,
    deleteUser,
    promoteOrDemoteUser,
  };
});

if (import.meta.hot) import.meta.hot.accept(acceptHMRUpdate(useUserStore, import.meta.hot));

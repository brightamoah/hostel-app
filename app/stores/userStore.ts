import type { FormSubmitEvent } from "@nuxt/ui";

import { acceptHMRUpdate, defineStore } from "pinia";

import type { AddAdminSchema } from "~/utils/schema";

export const useUserStore = defineStore("userStore", () => {
  const addModalOpen = ref<boolean>(false);
  const deleteModalOpen = ref<boolean>(false);
  const isLoading = ref<boolean>(false);

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
      && adminState.value.hostelId && adminState.value.hostelId > 0
    );
  });

  const addNewAdmin = async (payload: FormSubmitEvent<AddAdminSchema>) => {
    if (!isFormValid.value)
      return;

    isLoading.value = true;
    try {
      // simulate 3 second delay
      await new Promise(resolve => setTimeout(resolve, 3000));
      // Call your API to add a new admin here
      console.log("New admin added:", payload.data);
      addModalOpen.value = false;
      resetAddAdminState();
    }
    catch (error) {
      console.error("Error adding new admin:", error);
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
    deleteModalOpen,
    isLoading,
    adminState,
    isFormValid,
    addModalOpen,
    addNewAdmin,
    resetAddAdminState,
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useUserStore, import.meta.hot));
}

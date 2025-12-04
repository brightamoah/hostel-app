import type { FormSubmitEvent } from "@nuxt/ui";

import { acceptHMRUpdate, defineStore } from "pinia";

export const useRoomStore = defineStore("roomStore", () => {
  const toast = useToast();
  const { user } = useUserSession();
  const roomDataKey = computed(() => `roomData:${user.value?.adminData?.accessLevel}`);
  const isModalOpen = ref<boolean>(false);

  const isLoading = ref<boolean>(false);

  const roomType = ref<AddRoomSchema["roomType"][]>([
    "single",
    "double",
    "triple",
    "quad",
  ]);

  const roomStatus = ref<AddRoomSchema["status"][]>([
    "vacant",
    "fully occupied",
    "partially occupied",
    "under maintenance",
    "reserved",
  ]);

  const addRoomState = ref<Partial<RoomFormState>>({
    amountPerYear: 0,
    hostelId: undefined,
    capacity: 0,
    currentOccupancy: 0,
    features: "",
    floor: 0,
    roomNumber: "",
    roomType: "",
    status: "",
  });

  const getRoomCapacity = computed(() => {
    const roomCapacities = {
      single: 1,
      double: 2,
      triple: 3,
      quad: 4,
    } as const;
    const roomType = addRoomState.value.roomType as keyof typeof roomCapacities;
    return roomCapacities[roomType] ?? 0;
  });

  watch(() => addRoomState.value.roomType, () => {
    const capacity = getRoomCapacity.value;
    if (addRoomState.value.currentOccupancy && capacity < addRoomState.value.currentOccupancy) addRoomState.value.currentOccupancy = capacity;

    addRoomState.value.capacity = capacity;
  }, { immediate: true });

  const isFormValid = computed(() => {
    return addRoomSchema.safeParse(addRoomState.value).success;
  });

  const addNewRoom = async (payload: FormSubmitEvent<AddRoomSchema>) => {
    if (!isFormValid.value) return;

    isLoading.value = true;
    try {
      const response = await $fetch("/api/room/addNewRoom", {
        method: "POST",
        body: payload.data,
      });

      await refreshNuxtData(roomDataKey.value);

      toast.add({
        title: response.message,
        description: "The room has been added successfully.",
        color: "success",
        icon: "i-lucide-check-circle",
      });

      isModalOpen.value = false;
      resetAddRoomState();
    }
    catch (error) {
      const message = (error as any)?.data?.message;
      toast.add({
        title: "Failed to Add Room",
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

  function resetAddRoomState() {
    addRoomState.value = {
      amountPerYear: 0,
      hostelId: undefined,
      capacity: 0,
      currentOccupancy: 0,
      features: "",
      floor: 0,
      roomNumber: "",
      roomType: "",
      status: "",
    };
  };

  const deleteModalOpen = ref<boolean>(false);

  const deleteRoom = async (payload: DeleteItemSchema) => {
    if (!payload.ids) return;

    isLoading.value = true;

    try {
      const response = await $fetch("/api/room/deleteRoom", {
        method: "DELETE",
        body: payload,
      });

      toast.add({
        title: response.message,
        description: "The room has been deleted successfully.",
        color: "success",
        icon: "i-lucide-check-circle",
      });
      await refreshNuxtData(roomDataKey.value);
    }
    catch (error) {
      const message = (error as any)?.data?.message;
      toast.add({
        title: "Failed to Delete Room",
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
    addRoomState,
    roomType,
    roomStatus,
    getRoomCapacity,
    isFormValid,
    isLoading,
    isModalOpen,
    deleteModalOpen,
    roomDataKey,
    resetAddRoomState,
    addNewRoom,
    deleteRoom,
  };
});
if (import.meta.hot) import.meta.hot.accept(acceptHMRUpdate(useRoomStore, import.meta.hot));

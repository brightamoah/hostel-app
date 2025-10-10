import type { FormSubmitEvent } from "@nuxt/ui";

import { acceptHMRUpdate, defineStore } from "pinia";

export const useRoomStore = defineStore("roomStore", () => {
  const toast = useToast();

  const isModalOpen = ref<boolean>(false);

  const isLoading = ref<boolean>(false);

  const addRoomState = ref<AddRoomSchema>({
    amountPerYear: 0,
    building: "",
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
    if (capacity < addRoomState.value.currentOccupancy) {
      addRoomState.value.currentOccupancy = capacity;
    }
    addRoomState.value.capacity = capacity;
  }, { immediate: true });

  const isFormValid = computed(() => {
    return (
      addRoomState.value.roomNumber.trim() !== ""
      && addRoomState.value.building.trim() !== ""
      && addRoomState.value.floor > 0
      && addRoomState.value.capacity >= 1
      && addRoomState.value.roomType.trim() !== ""
      && addRoomState.value.features.trim() !== ""
      && addRoomState.value.amountPerYear > 0
      && addRoomState.value.status.trim() !== ""
      && addRoomState.value.currentOccupancy >= 0
    );
  });

  const addNewRoom = async (payload: FormSubmitEvent<AddRoomSchema>) => {
    if (!isFormValid.value)
      return;

    isLoading.value = true;
    try {
      const response = await $fetch("/api/room/addNewRoom", {
        method: "POST",
        body: payload.data,
      });

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
      building: "",
      capacity: 0,
      currentOccupancy: 0,
      features: "",
      floor: 0,
      roomNumber: "",
      roomType: "",
      status: "",
    };
  };

  return {
    addRoomState,
    isFormValid,
    isLoading,
    isModalOpen,
    resetAddRoomState,
    addNewRoom,
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useRoomStore, import.meta.hot));
}

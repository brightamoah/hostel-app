<script setup lang="ts">
import { useMediaQuery } from "@vueuse/core";

const { roomData, roomId } = defineProps<{
  roomId: number;
  roomData: RoomFormState;
}>();

const roomStore = useRoomStore();
const {
  roomStatus: roomStatusItems,
  roomType: roomTypeItems,
  isLoading,
} = storeToRefs(roomStore);

const toast = useToast();

const isMobile = useMediaQuery("(max-width: 640px)");
const isEditModalOpen = ref(false);
const editRoomFormRef = useTemplateRef("editRoomFormRef");

const roomNumberValue = computed(() => roomData.roomNumber);
const buildingValue = computed(() => roomData.building);
const roomType = computed(() => roomData.roomType);
const roomStatus = computed(() => roomData.status);
const roomFeatures = computed(() => roomData.features ?? "");
const roomCapacity = computed(() => roomData.capacity);
const amountPerYear = computed(() => Number(roomData.amountPerYear));
const currentOccupancy = computed(() => roomData.currentOccupancy);
const floor = computed(() => roomData.floor);

const editRoomState = ref<RoomFormState>(
  {
    roomNumber: roomNumberValue.value,
    building: buildingValue.value,
    roomType: roomType.value,
    status: roomStatus.value,
    features: roomFeatures.value,
    capacity: roomCapacity.value,
    amountPerYear: amountPerYear.value,
    currentOccupancy: currentOccupancy.value,
    floor: floor.value,
  },
);

const getChangedFields = computed(() => {
  const original = roomData;
  const current = editRoomState.value;
  const changed: Partial<AddRoomSchema> = {};

  const fieldsToCompare: (keyof AddRoomSchema)[] = [
    "roomNumber",
    "building",
    "floor",
    "capacity",
    "amountPerYear",
    "currentOccupancy",
  ];

  fieldsToCompare.forEach((field) => {
    if (current[field] !== original[field]) {
      changed[field] = current[field] as any;
    }
  });

  if (current.roomType !== original.roomType && current.roomType !== "") {
    changed.roomType = current.roomType;
  }
  if (current.status !== original.status && current.status !== "") {
    changed.status = current.status;
  }

  if (current.features !== original.features) {
    changed.features = current.features
      .split(",")
      .map(f => f.trim())
      .filter(Boolean);
  }

  return changed;
});

// const getChangedFields = computed(() => {
//   const original = roomData;
//   const current = editRoomState.value;
//   const changed: Partial<AddRoomSchema> = {};

//   if (current.roomNumber !== original.roomNumber)
//     changed.roomNumber = current.roomNumber;
//   if (current.building !== original.building)
//     changed.building = current.building;
//   if (current.floor !== original.floor)
//     changed.floor = current.floor;
//   if (current.roomType !== original.roomType && current.roomType !== "")
//     changed.roomType = current.roomType;
//   if (current.status !== original.status && current.status !== "")
//     changed.status = current.status;
//   if (current.features !== original.features) {
//     changed.features = current.features.split(",").map(f => f.trim()).filter(Boolean);
//   }
//   if (current.capacity !== original.capacity)
//     changed.capacity = current.capacity;
//   if (current.amountPerYear !== original.amountPerYear)
//     changed.amountPerYear = current.amountPerYear;
//   if (current.currentOccupancy !== original.currentOccupancy)
//     changed.currentOccupancy = current.currentOccupancy;

//   return changed;
// });

async function submitUpdate() {
  const changed = getChangedFields.value;

  if (Object.keys(changed).length === 0) {
    toast.add({
      title: "No Changes",
      description: "No fields have been modified.",
      color: "warning",
      icon: "i-lucide-alert-triangle",
    });
    isEditModalOpen.value = false;
    return;
  }

  const payload = {
    roomId,
    data: changed,
  };

  isLoading.value = true;

  try {
    const { refresh } = useFetchRoomData();

    const response = await $fetch(`/api/room/${roomId}`, {
      method: "PATCH",
      body: payload,
    });

    await refresh();
    toast.add({
      title: response.message,
      description: "The room details have been updated successfully.",
      color: "success",
      icon: "i-lucide-check-circle",
    });
    isEditModalOpen.value = false;
  }
  catch (error) {
    const message = (error as any)?.data?.message || "Failed to update room";
    toast.add({
      title: "Update Failed",
      description: message,
      color: "error",
      icon: "i-lucide-alert-circle",
      duration: 8000,
    });
  }
  finally {
    isLoading.value = false;
  }
}
</script>

<template>
  <UModal
    v-model:open="isEditModalOpen"
    description="Modify the details of the room below."
    :title="`Edit Room ${roomNumberValue}`"
    :dismissible="false"
    :ui="{
      footer: 'justify-end',
      content: 'w-[90%] max-w-4xl  rounded-lg shadow-lg ring ring-default overflow-hidden',
      title: 'font-newsreader text-xl font-semibold',
      close: 'cursor-pointer',
    }"
  >
    <h1>editModal</h1>

    <template #body>
      <UForm
        ref="editRoomFormRef"
        :state="editRoomState"
        :schema="addRoomSchema"
        @submit="submitUpdate"
      >
        <div class="flex md:flex-row flex-col justify-between gap-5 mb-4 px-4">
          <UFormField
            required
            label="Room Number"
            name="roomNumber"
            class="w-full"
          >
            <UInput
              v-model="editRoomState.roomNumber"
              placeholder="Enter room number"
              class="w-[100%]"
              :size="isMobile ? 'lg' : 'xl'"
            />
          </UFormField>

          <UFormField
            required
            label="Building"
            name="building"
            class="w-full"
          >
            <UInput
              v-model="editRoomState.building"
              placeholder="Enter building name"
              class="w-[100%]"
              :size="isMobile ? 'lg' : 'xl'"
            />
          </UFormField>
        </div>

        <div class="flex md:flex-row flex-col justify-between gap-5 mb-4 px-4">
          <UFormField
            required
            label="Floor"
            name="floor"
            class="w-full"
          >
            <UInputNumber
              v-model="editRoomState.floor"
              placeholder="Enter floor number"
              class="w-[100%]"
              :min="1"
              :max="10"
              :size="isMobile ? 'lg' : 'xl'"
            />
          </UFormField>

          <UFormField
            required
            label="Room Type"
            name="roomType"
            class="w-full"
          >
            <USelectMenu
              v-model="editRoomState.roomType"
              :items="roomTypeItems"
              placeholder="Select room type"
              class="w-[100%] cursor-pointer"
              :size="isMobile ? 'lg' : 'xl'"
            />
          </UFormField>
        </div>

        <div class="flex md:flex-row flex-col justify-between gap-5 mb-4 px-4">
          <UFormField
            required
            label="Capacity"
            name="capacity"
            class="w-full"
          >
            <UInputNumber
              v-model="editRoomState.capacity"
              placeholder="Enter room capacity"
              class="w-[100%]"
              readonly
              :min="1"
              :max="4"
              :size="isMobile ? 'lg' : 'xl'"
            />
          </UFormField>

          <UFormField
            required
            label="Amount Per Year"
            name="amountPerYear"
            class="w-full"
          >
            <UInputNumber
              v-model="editRoomState.amountPerYear"
              placeholder="Enter amount per year"
              class="w-[100%]"
              :min="1"
              :size="isMobile ? 'lg' : 'xl'"
              :format-options="{
                style: 'currency',
                currency: 'GHS',
                notation: 'standard',
                localeMatcher: 'best fit',
                currencyDisplay: 'narrowSymbol',
                currencySign: 'accounting',
              }"
            />
          </UFormField>
        </div>

        <div class="flex md:flex-row flex-col justify-between gap-5 mb-4 px-4">
          <UFormField
            required
            label="Current Occupancy"
            name="currentOccupancy"
            class="w-full"
          >
            <UInputNumber
              v-model="editRoomState.currentOccupancy"
              placeholder="Enter current occupancy"
              class="w-[100%]"
              :min="0"
              :max="4"
              :size="isMobile ? 'lg' : 'xl'"
            />
          </UFormField>

          <UFormField
            required
            label="Status"
            name="status"
            class="w-full"
          >
            <USelectMenu
              v-model="editRoomState.status"
              :items="roomStatusItems"
              placeholder="Select room status"
              class="w-[100%] cursor-pointer"
              :size="isMobile ? 'lg' : 'xl'"
            />
          </UFormField>
        </div>

        <UFormField
          required
          label="Features"
          name="features"
          class="w-full"
        >
          <UTextarea
            v-model.trim="editRoomState.features"
            placeholder="Enter room features (comma separated)"
            class="w-[100%]"
            :size="isMobile ? 'lg' : 'xl'"
          />
        </UFormField>
      </UForm>
    </template>

    <template #footer="{ close }">
      <div class="flex gap-2.5">
        <UButton
          label="Cancel"
          color="error"
          variant="outline"
          class="cursor-pointer"
          @click="close"
        />

        <UButton
          :label="isLoading ? 'Submitting...' : 'Submit'"
          color="primary"
          icon="i-lucide-send"
          class="cursor-pointer"
          :loading="isLoading"
          @click="editRoomFormRef?.submit()"
        />
      </div>
    </template>
  </UModal>
</template>

<style scoped></style>

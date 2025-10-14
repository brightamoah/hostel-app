<script setup lang="ts">
import { useMediaQuery } from "@vueuse/core";

const { roomData } = defineProps<{
  // roomId: number;
  roomData: AddRoomSchema;
}>();

const isMobile = useMediaQuery("(max-width: 640px)");
const isEditModalOpen = ref(false);
const editRoomFormRef = useTemplateRef("editRoomFormRef");

const roomNumberValue = computed(() => roomData.roomNumber);
const buildingValue = computed(() => roomData.building);
const roomType = computed(() => roomData.roomType);
const roomStatus = computed(() => roomData.status);
const roomFeatures = computed(() => roomData.features);
const roomCapacity = computed(() => roomData.capacity);
const amountPerYear = computed(() => roomData.amountPerYear);
const currentOccupancy = computed(() => roomData.currentOccupancy);
const floor = computed(() => roomData.floor);

const editRoomState = ref<AddRoomSchema>(
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
      </UForm>
    </template>
  </UModal>
</template>

<style scoped>

</style>

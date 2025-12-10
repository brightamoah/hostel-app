<script setup lang="ts">
const isMobile = inject("isMobile") as ComputedRef<boolean>;

const roomStore = useRoomStore();
const {
  addRoomState,
  isFormValid,
  isLoading,
  isModalOpen,
} = storeToRefs(roomStore);

const addRoomFormRef = useTemplateRef("addRoomFormRef");

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

const {
  hostels,
  hostelItem,
  isLoading: isHostelsLoading,
  handleRefresh,
} = useFetchRoomData();

watch(
  () => isModalOpen.value,
  async (open) => {
    if (!open) roomStore.resetAddRoomState();

    if (open && hostels.value.length === 0) {
      try {
        await handleRefresh();
      }
      catch (error) {
        console.error("Failed to fetch hostels:", error);
      }
    }
  },
);
</script>

<template>
  <UModal
    v-model:open="isModalOpen"
    title="Add New Room"
    description="Fill in the details below to add a new room to the system."
    class="w-[90%]"
    :dismissible="false"
    :ui="{
      footer: 'justify-end',
      content: 'w-[90%] max-w-4xl  rounded-lg shadow-lg ring ring-default overflow-hidden',
      title: 'font-newsreader text-xl font-semibold',
      close: 'cursor-pointer',
    }"
  >
    <UButton
      label="Add Room"
      icon="i-lucide-house-plus"
      size="lg"
      class="justify-center items-center w-full sm:w-auto cursor-pointer"
    />

    <template #body>
      <UForm
        ref="addRoomFormRef"
        :state="addRoomState"
        :schema="addRoomSchema"
        @submit="roomStore.addNewRoom"
      >
        <div class="flex md:flex-row flex-col justify-between gap-5 mb-4 px-4">
          <UFormField
            required
            label="Room Number"
            name="roomNumber"
            class="w-full"
          >
            <UInput
              v-model.trim="addRoomState.roomNumber"
              placeholder="Enter room number"
              class="w-full"
              :size="isMobile ? 'lg' : 'xl'"
            />
          </UFormField>

          <UFormField
            required
            label="Hostel"
            name="hostelId"
            class="w-full"
          >
            <USelectMenu
              v-model="addRoomState.hostelId"
              placeholder="Select Hostel"
              class="w-full cursor-pointer"
              value-key="value"
              :items="hostelItem"
              :loading="isHostelsLoading"
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
              v-model="addRoomState.floor"
              placeholder="Enter floor number"
              class="w-full"
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
              v-model="addRoomState.roomType"
              :items="roomType"
              placeholder="Select room type"
              class="w-full cursor-pointer"
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
              v-model="addRoomState.capacity"
              placeholder="Enter room capacity"
              class="w-full"
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
              v-model="addRoomState.amountPerYear"
              placeholder="Enter amount per year"
              class="w-full"
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
              v-model="addRoomState.currentOccupancy"
              placeholder="Enter current occupancy"
              class="w-full"
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
              v-model="addRoomState.status"
              :items="roomStatus"
              placeholder="Select room status"
              class="w-full cursor-pointer"
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
            v-model="addRoomState.features"
            placeholder="Enter room features (comma separated)"
            class="w-full"
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
          :label=" isLoading ? 'Submitting...' : 'Submit'"
          color="primary"
          icon="i-lucide-send"
          class="cursor-pointer"
          :loading="isLoading"
          :disabled="!isFormValid"
          @click="addRoomFormRef?.submit()"
        />
      </div>
    </template>
  </UModal>
</template>

<style scoped>

</style>

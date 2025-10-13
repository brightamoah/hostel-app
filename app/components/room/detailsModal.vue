<script setup lang="ts">
import type { RoomDetailResponse } from "~/types";

const { roomId } = defineProps<{ roomId: number }>();
const emit = defineEmits<{ close: [boolean] }>();

const { data, error, status } = useFetch<RoomDetailResponse>(`/api/room/${roomId}`, {
  method: "GET",
  key: computed(() => `room-details-${roomId}`),
});

const room = computed(() => data.value?.room);

const { featureIcons, statusColorMap } = useRoomColorIcon(room);

const { getErrorMessage } = getSpecificRoomError();

const errorInfo = computed(() => getErrorMessage(error.value));
</script>

<template>
  <UModal
    :title="room ? `Room ${room.roomNumber} Details` : 'Room Details'"
    description="Detailed information about the selected room."
    :dismissible="false"
    :ui="{
      footer: 'justify-end',
      content: 'w-[90%] max-w-4xl h-auto rounded-lg shadow-lg ring ring-default overflow-hidden',
      title: 'font-newsreader text-xl font-semibold',
      description: 'text-base text-muted',
      close: 'cursor-pointer',
    }"
  >
    <template #body>
      <div
        v-if="status === 'pending'"
        class="flex flex-col justify-center items-center py-16"
      >
        <UIcon
          name="i-lucide-loader"
          class="w-10 h-10 text-primary animate-spin"
        />

        <p class="mt-4 text-muted">
          Loading room details...
        </p>
      </div>

      <div
        v-else-if="status === 'error'"
        class="flex flex-col justify-center items-center py-16"
      >
        <UIcon
          :name="errorInfo.icon ?? 'i-lucide-alert-triangle'"
          class="w-10 h-10 text-error"
        />

        <p class="mt-4 text-error">
          Error loading data: {{ errorInfo.message }}
        </p>
      </div>

      <div v-else-if="room">
        <UCard class="border-1 border-muted">
          <div class="flex justify-between items-center">
            <h3 class="font-semibold text-xl">
              Room {{ room.roomNumber }}
              <span class="flex gap-1.5 mt-1 font-normal text-sm text-center">
                <UIcon
                  name="i-lucide-map-pinned"
                  class="size-5"
                />
                {{ room.building }}, Floor {{ room.floor }}
              </span>
            </h3>

            <UBadge
              :label="room.roomType"
              color="primary"
              variant="subtle"
              size="lg"
              class="capitalize"
            />
          </div>
        </UCard>

        <div class="gap-4 grid grid-cols-1 md:grid-cols-2 mt-4">
          <UCard class="border-1 border-muted">
            <template #header>
              <div class="flex items-center gap-2">
                <UIcon
                  name="i-lucide-info"
                  class="size-5"
                />

                <h4 class="font-semibold text-base">
                  Room Information
                </h4>
              </div>
            </template>

            <template #default>
              <div class="gap-4 grid grid-cols-2">
                <RoomDetailItem
                  label="Room Number"
                  :value="room.roomNumber"
                />

                <RoomDetailItem
                  label="Building"
                  :value="room.building"
                />

                <RoomDetailItem
                  label="Amount Per Year"
                  :value="formatCurrency(Number(room.amountPerYear))"
                />

                <RoomDetailItem
                  label="Room Type"
                  :value="room.roomType"
                  class="capitalize"
                />

                <RoomDetailItem
                  label="Floor"
                  :value="room.floor"
                />
              </div>
            </template>
          </UCard>

          <UCard class="border-1 border-muted">
            <template #header>
              <div class="flex items-center gap-2">
                <UIcon
                  name="i-lucide-users"
                  class="size-5"
                />

                <h4 class="font-semibold text-base">
                  Room Occupancy
                </h4>
              </div>
            </template>

            <template #default>
              <div>
                <p class="pb-1 text-muted text-sm">
                  Status
                </p>

                <UBadge
                  :label="room.status"
                  :color="statusColorMap[room.status] || 'neutral'"
                  variant="subtle"
                  size="lg"
                  class="capitalize"
                />
              </div>

              <div class="gap-4 grid grid-cols-2 mt-3">
                <RoomDetailItem
                  label="Total Capacity"
                  :value="room.capacity"
                />

                <RoomDetailItem
                  label="Current Occupants"
                  :value="room.currentOccupancy"
                />
              </div>

              <UProgress
                v-model="room.currentOccupancy"
                size="lg"
                class="relative mt-4 text-left"
                :max="room.capacity"
                :color="statusColorMap[room.status] || 'neutral'"
                :ui="{
                  status: 'text-muted text-left',
                }"
              >
                <template #status>
                  <p class="-bottom-6 left-0 absolute w-full">
                    {{ room.capacity - room.currentOccupancy }} of {{ room.capacity }} spaces
                    available
                  </p>
                </template>
              </UProgress>
            </template>
          </UCard>
        </div>

        <UCard class="mt-4 border-1 border-muted">
          <template #header>
            <div class="flex items-center gap-2">
              <UIcon
                name="i-lucide-list-checks"
                class="size-6"
              />

              <h4 class="font-semibold text-base">
                Room Features & Amenities
              </h4>
            </div>
          </template>

          <div class="flex flex-wrap gap-3">
            <UBadge
              v-for="feature in featureIcons"
              :key="feature.name"
              :icon="feature.icon"
              color="primary"
              variant="soft"
              size="lg"
              class="capitalize"
            >
              {{ feature.name }}
            </UBadge>
          </div>
        </UCard>
      </div>
    </template>

    <template #footer>
      <UButton
        color="primary"
        variant="solid"
        class="cursor-pointer"
        @click="emit('close', false)"
      >
        Close
      </UButton>
    </template>
  </UModal>
</template>

<style scoped></style>

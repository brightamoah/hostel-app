<script setup lang="ts">
import type { Room } from "~/types";

const { room } = defineProps<{
  room: Room;
}>();

const emit = defineEmits<{ close: [boolean] }>();

const roomValue = computed(() => room);

const { featureIcons, statusColorMap } = useRoomColorIcon(roomValue);
</script>

<template>
  <UModal
    :title="roomValue ? `Room ${roomValue.roomNumber} Details` : 'Room Details'"
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
      <div>
        <UCard class="border border-muted">
          <div class="flex justify-between items-center">
            <h3 class="font-semibold text-xl">
              Room {{ roomValue.roomNumber }}
              <span class="flex gap-1.5 mt-1 font-normal text-sm text-center">
                <UIcon
                  name="i-lucide-map-pinned"
                  class="size-5"
                />
                {{ roomValue.building }}, Floor {{ roomValue.floor }}
              </span>
            </h3>

            <UBadge
              :label="roomValue.roomType"
              color="primary"
              variant="subtle"
              size="lg"
              class="capitalize"
            />
          </div>
        </UCard>

        <div class="gap-4 grid grid-cols-1 md:grid-cols-2 mt-4">
          <UCard class="border border-muted">
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
                <DashboardDetailItem
                  label="Room Number"
                  :value="roomValue.roomNumber"
                />

                <DashboardDetailItem
                  label="Building"
                  :value="roomValue.building"
                />

                <DashboardDetailItem
                  label="Amount Per Year"
                  :value="formatCurrency(Number(roomValue.amountPerYear))"
                />

                <DashboardDetailItem
                  label="Room Type"
                  :value="roomValue.roomType"
                  class="capitalize"
                />

                <DashboardDetailItem
                  label="Floor"
                  :value="roomValue.floor"
                />
              </div>
            </template>
          </UCard>

          <UCard class="border border-muted">
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
                  :label="roomValue.status"
                  :color="statusColorMap[roomValue.status] || 'neutral'"
                  variant="subtle"
                  size="lg"
                  class="capitalize"
                />
              </div>

              <div class="gap-4 grid grid-cols-2 mt-3">
                <DashboardDetailItem
                  label="Total Capacity"
                  :value="roomValue.capacity"
                />

                <DashboardDetailItem
                  label="Current Occupants"
                  :value="roomValue.currentOccupancy"
                />
              </div>

              <UProgress
                v-model="roomValue.currentOccupancy"
                size="lg"
                class="relative my-2 text-left"
                :max="roomValue.capacity"
                :color="statusColorMap[roomValue.status] || 'neutral'"
                :ui="{
                  status: 'text-muted text-left',
                }"
              >
                <template #status>
                  <p class="-bottom-5 md:-bottom-6 left-0 absolute w-full">
                    {{ roomValue.capacity - roomValue.currentOccupancy }} of {{ roomValue.capacity }} spaces
                    available
                  </p>
                </template>
              </UProgress>
            </template>
          </UCard>
        </div>

        <UCard class="mt-4 border border-muted">
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

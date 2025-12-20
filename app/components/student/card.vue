<script setup lang="ts">
import { capitalize } from "vue";

const cards = ref([
  {
    title: "Room Details",
    icon: "i-lucide-house",
    color: "primary",
    value: "Room 101",
  },
  {
    title: "Room Details",
    icon: "i-lucide-bed-double",
    color: "primary",
    value: "Room 101",
  },
]);

const roomDetails = ref([
  {
    label: "room number",
    value: "101",
    icon: "i-lucide-door-open",
  },
  {
    label: "type",
    value: "Single",
    icon: "i-lucide-bed",
  },
  {
    label: "capacity",
    value: "1 Person",
    icon: "i-lucide-users",
  },
  {
    label: "floor",
    value: "1st Floor",
    icon: "i-lucide-layers",
  },
  {
    label: "status",
    value: "Occupied",
    icon: "i-lucide-circle-check",
  },
  {
    label: "amount",
    value: formatCurrency(Number(1500)),
    icon: "i-lucide-indian-rupee",
  },
]);
</script>

<template>
  <UPageGrid>
    <UCard
      v-for="(card, index) in cards"
      :key="index"
      :ui="{
        header: 'border-b-0 p-4 px-4',
      }"
    >
      <template #header>
        <div class="flex items-center gap-2">
          <UIcon
            :name="card.icon"
            class="size-6"
          />

          <h4 class="font-semibold text-base">
            Room Details
          </h4>
        </div>

        <USeparator
          class="justify-start mt-1.5 rounded-full w-30"
          size="md"
          decorative
        />
      </template>

      <div class="items-center grid grid-cols-2 -mt-6 text-base">
        <ul class="space-y-1">
          <li
            v-for="detail in roomDetails"
            :key="detail.label"
          >
            <UIcon
              :name="detail.icon"
              class="size-4.5 text-primary"
            />

            {{ capitalize(detail.label) }}
          </li>
        </ul>

        <ul class="space-y-1">
          <li
            v-for="detail in roomDetails"
            :key="detail.label"
          >
            {{ capitalize(detail.value) }}
          </li>
        </ul>
      </div>

      <template #footer>
        <div class="gap-2 grid grid-cols-1 md:grid-cols-2">
          <StudentRoommate />

          <UButton
            icon="i-lucide-wrench"
            label="Request Maintenance"
            class="flex-1 cursor-pointer"
            :to="{ name: 'student-maintenance' }"
            :ui="{
              base: 'text-center flex items-center justify-center gap-2',
            }"
          />
        </div>
      </template>
    </UCard>

    <UButton
      label="Test Button"
      :to="{ name: 'new' }"
    />
  </UPageGrid>
</template>

<style scoped>

</style>

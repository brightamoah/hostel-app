<script setup lang="ts">
import type { RouteLocationRaw } from "vue-router";

import { capitalize } from "vue";

const cards = ref([
  {
    id: "room" as const,
    title: "Room Details",
    icon: "i-lucide-house",
    color: "primary",
    value: "Room 101",
    class: "",
    to: { name: "student-rooms" } as RouteLocationRaw,
  },
  {
    id: "visitors" as const,
    title: "Visitors For Today",
    icon: "i-lucide-users",
    color: "success",
    value: "Room 101",
    class: "lg:col-span-2",
    to: { name: "student-visitors" } as RouteLocationRaw,
  },
  {
    id: "requests" as const,
    title: "Pending Requests",
    icon: "i-lucide-inbox",
    color: "warning",
    value: "Room 101",
    class: "lg:col-span-2",
    to: { name: "student-maintenance" } as RouteLocationRaw,
  },
  {
    id: "billing" as const,
    title: "Billing & Payments",
    icon: "i-lucide-credit-card",
    color: "error",
    value: "Room 101",
    class: "",
    to: { name: "student-billing" } as RouteLocationRaw,
  },
]);

const context = inject(dashboardKey);

if (!context) throw new Error("DashboardContext not found");

const { room: roomVal } = context;

const roomDetails = computed(() => {
  const room = unref(roomVal);

  if (!room) {
    return [];
  }

  return [
    {
      label: "room number",
      value: room.roomNumber,
      icon: "i-lucide-door-open",
    },
    {
      label: "type",
      value: room.roomType,
      icon: "i-lucide-bed",
    },
    {
      label: "capacity",
      value: `${room.capacity} Person(s)`,
      icon: "i-lucide-users",
    },
    {
      label: "floor",
      value: `${getOrdinalString(room.floor)} Floor`,
      icon: "i-lucide-layers",
    },
    {
      label: "status",
      value: capitalize(room.status),
      icon: "i-lucide-circle-check",
    },
    {
      label: "amount",
      value: formatCurrency(room.amountPerYear),
      icon: "i-lucide-banknote",
    },
  ];
});

function getLabel(id: string) {
  const labels: Record<string, string> = {
    room: "View Room",
    visitors: "View All Visitors",
    requests: "View All Requests",
    billing: "View Payments",
  };

  return labels[id] ?? "View All";
}
</script>

<template>
  <div class="gap-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mt-4">
    <UCard
      v-for="card in cards"
      :key="card.id"
      :class="card.class"
      class="border-2 border-muted"
      :ui="{
        header: 'border-b-0 p-4 px-4',
      }"
    >
      <template #header>
        <div class="justify-between grid grid-cols-2">
          <div class="flex items-center gap-2">
            <UIcon
              :name="card.icon"
              :class="`size-5 text-${card.color}`"
            />

            <h4 class="font-semibold text-base">
              {{ card.title }}
            </h4>
          </div>

          <UButton
            v-if="card.id !== 'room'"
            :label="getLabel(card.id)"
            :to="card.to"
            variant="subtle"
            size="sm"
            color="neutral"
            class="justify-self-end mt-2 cursor-pointer"
          />
        </div>

        <USeparator
          class="justify-start mt-1.5 rounded-full w-35"
          size="lg"
          decorative
        />
      </template>

      <StudentRoom
        v-if="card.id === 'room'"
        :room-details
        :room-val
      />

      <StudentVisitor v-else-if="card.id === 'visitors'" />

      <StudentRequest v-else-if="card.id === 'requests'" />

      <template
        v-if="card.id === 'room' && roomVal"
        #footer
      >
        <div class="gap-2 grid grid-cols-1 md:grid-cols-2">
          <StudentRoommate />

          <UButton
            icon="i-lucide-wrench"
            label="Maintenance"
            class="flex-1 cursor-pointer"
            :to="{ name: 'student-maintenance' }"
            :ui="{
              base: 'text-center flex items-center justify-center gap-2',
            }"
          />
        </div>
      </template>
    </UCard>
  </div>
</template>

<style scoped>

</style>

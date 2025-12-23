<script setup lang="ts">
import { capitalize } from "vue";

const cards = ref([
  {
    id: "room" as const,
    title: "Room Details",
    icon: "i-lucide-house",
    color: "primary",
    value: "Room 101",
    class: "",
  },
  {
    id: "visitors" as const,
    title: "Visitors For Today",
    icon: "i-lucide-users",
    color: "success",
    value: "Room 101",
    class: "lg:col-span-2",
  },
  {
    id: "requests" as const,
    title: "Pending Requests",
    icon: "i-lucide-inbox",
    color: "warning",
    value: "Room 101",
    class: "lg:col-span-2",
  },
  {
    id: "billing" as const,
    title: "Billing & Payments",
    icon: "i-lucide-credit-card",
    color: "error",
    value: "Room 101",
    class: "",
  },
]);

const context = inject(dashboardKey);

if (!context) throw new Error("DashboardContext not found");

const { room: roomVal, visitors } = context;

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
      value: `${room.floor}${getOrdinal(room.floor)} Floor`,
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

function getOrdinal(n: number) {
  const s = ["th", "st", "nd", "rd"];
  const value = n % 100;
  return s[(value - 20) % 10] || s[value] || s[0];
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
        <div class="flex items-center gap-2">
          <UIcon
            :name="card.icon"
            :class="`size-5 text-${card.color}`"
          />

          <h4 class="font-semibold text-base">
            {{ card.title }}
          </h4>
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

      <StudentVisitor
        v-else-if="card.id === 'visitors'"
        :visitors
      />

      <div v-else-if="card.id === 'requests'">
        {{
          card.value }}
      </div>

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

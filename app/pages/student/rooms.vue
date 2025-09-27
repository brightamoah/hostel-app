<script lang="ts" setup>
import type { StatsCard } from "~/types";

definePageMeta({
  middleware: ["requires-auth"],
  layout: "student-dashboard",
});

const title = ref("Student Rooms");

const cards = ref<StatsCard[]>([
  {
    id: 1,
    title: "Total Rooms",
    icon: "i-lucide-building-2",
    color: "primary",
    value: 150,
    percentage: 5.2,
    period: "monthly",
  },
  {
    id: 2,
    title: "Occupied Rooms",
    icon: "i-lucide-users",
    color: "info",
    value: 120,
    percentage: 8.1,
    period: "monthly",
  },
  {
    id: 3,
    title: "Available Rooms",
    icon: "i-lucide-check-circle",
    color: "success",
    value: 30,
    percentage: -3.4,
    period: "weekly",
  },
  {
    id: 4,
    title: "Maintenance Needed",
    icon: "i-heroicons-wrench-screwdriver",
    color: "warning",
    value: 5,
    percentage: 10.0,
    period: "daily",
  },
]);
</script>

<template>
  <div class="flex flex-1">
    <UDashboardPanel id="rooms">
      <template #header>
        <DashboardNav :title />
      </template>
      <template #body>
        <div class="p-4">
          <DashboardStatsCard :cards />
          <h1 class="mb-4 font-bold text-2xl">
            Rooms Dashboard
          </h1>
          <!-- Analytics content goes here -->
          <p>This is where you can display various rooms data.</p>
        </div>
      </template>
    </UDashboardPanel>
  </div>
</template>

<style scoped>

</style>

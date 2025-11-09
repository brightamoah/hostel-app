<script setup lang="ts">
definePageMeta({
  middleware: ["requires-auth", "admin"],
  layout: "admin-dashboard",
});
const title = ref("Maintenance Dashboard");

const cards = computed<StatsCard[]>(() => [
  {
    id: 1,
    title: "Total Rooms",
    icon: "i-lucide-building-2",
    color: "primary",
    value: 0,
    percentage: 5.2,
    period: "monthly",
  },
  {
    id: 2,
    title: "Occupied Rooms",
    icon: "i-lucide-users",
    color: "info",
    value: 0,
    percentage: 8.1,
    period: "monthly",
  },
  {
    id: 3,
    title: "Available Rooms",
    icon: "i-lucide-check-circle",
    color: "success",
    value: 0,
    percentage: -3.4,
    period: "weekly",
  },
  {
    id: 4,
    title: "Under Maintenance",
    icon: "i-heroicons-wrench-screwdriver",
    color: "warning",
    value: 0,
    percentage: 10.0,
    period: "daily",
  },
]);
</script>

<template>
  <div class="flex flex-1">
    <UDashboardPanel id="maintenance">
      <template #header>
        <DashboardNav :title />
      </template>

      <template #body>
        <div class="p-4">
          <h1 class="mb-4 font-bold text-2xl">
            Maintenance Dashboard
          </h1>
          <!-- Analytics content goes here -->
          <p>This is where you can display various maintenance requests.</p>

          <DashboardStatsCard :cards />
        </div>
      </template>
    </UDashboardPanel>
  </div>
</template>

<style scoped>

</style>

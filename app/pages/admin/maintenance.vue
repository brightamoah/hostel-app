<script setup lang="ts">
definePageMeta({
  middleware: ["requires-auth", "admin"],
  layout: "admin-dashboard",
});
const title = ref("Maintenance Dashboard");

const { data, status } = useFetchMaintenanceData();

const cards = computed<StatsCard[]>(() => [
  {
    id: 1,
    title: "Total Requests",
    icon: "i-heroicons-wrench-screwdriver",
    color: "primary",
    value: data.totalMaintenanceRequests,
    percentage: 5.2,
    period: "monthly",
  },
  {
    id: 2,
    title: "Pending Requests",
    icon: "i-lucide-clock",
    color: "warning",
    value: data.totalPending,
    percentage: 8.1,
    period: "monthly",
  },
  {
    id: 3,
    title: "Completed Requests",
    icon: "i-lucide-circle-check-big",
    color: "success",
    value: data.totalCompleted,
    percentage: -3.4,
    period: "weekly",
  },
  {
    id: 4,
    title: "In-progress",
    icon: "i-lucide-loader",
    color: "info",
    value: data.totalInProgress,
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
        <div class="p-2 md:p-4">
          <DashboardCardSkeleton v-if="status === 'pending'" />

          <DashboardStatsCard :cards />
        </div>
      </template>
    </UDashboardPanel>
  </div>
</template>

<style scoped>

</style>

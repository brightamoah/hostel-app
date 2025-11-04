<script setup lang="ts">
import type { StatsCard } from "~/types";

definePageMeta({
  middleware: ["requires-auth", "admin"],
  layout: "admin-dashboard",
});

const title = ref("Visitors Dashboard");

const cards = computed<StatsCard[]>(() => [
  {
    id: 1,
    title: "Total Visitors",
    icon: "i-lucide-users",
    color: "primary",
    value: 0,
    percentage: 5.2,
    period: "monthly",
  },
  {
    id: 2,
    title: "Approved Visitors",
    icon: "i-lucide-circle-check-big",
    color: "info",
    value: 0,
    percentage: 8.1,
    period: "monthly",
  },
  {
    id: 3,
    title: "Checked-in Visitors",
    icon: "i-lucide-log-in",
    color: "success",
    value: 0,
    percentage: -3.4,
    period: "weekly",
  },
  {
    id: 4,
    title: "Pending Visitors",
    icon: "i-lucide-clock",
    color: "warning",
    value: 0,
    percentage: 10.0,
    period: "daily",
  },
]);
</script>

<template>
  <div class="flex flex-1">
    <UDashboardPanel id="visitors">
      <template #header>
        <DashboardNav :title />
      </template>

      <template #body>
        <div class="p-2 md:p-4">
          <!-- <DashboardCardSkeleton v-if="status === 'pending'" /> -->

          <DashboardStatsCard :cards />
        </div>
      </template>
    </UDashboardPanel>
  </div>
</template>

<style scoped>

</style>

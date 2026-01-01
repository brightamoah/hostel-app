<script lang="ts" setup>
definePageMeta({
  middleware: ["requires-auth"],
  layout: "student-dashboard",
});

const title = ref("Complaints Dashboard");

const { data, status } = useFetchStudentComplaintData();

const cards = computed<StatsCard[]>(() => [
  {
    id: 1,
    title: "Total Complaints",
    icon: "i-lucide-message-square-quote",
    color: "primary",
    value: data.value.totalComplaints,
    percentage: 5.2,
    period: "monthly",
  },
  {
    id: 2,
    title: "Pending Complaints",
    icon: "i-lucide-clock",
    color: "warning",
    value: data.value.totalPending,
    percentage: 8.1,
    period: "monthly",
  },
  {
    id: 3,
    title: "In-progress",
    icon: "i-lucide-loader",
    color: "info",
    value: data.value.totalInProgress,
    percentage: 10.0,
    period: "daily",
  },
  {
    id: 4,
    title: "Resolved Complaints",
    icon: "i-lucide-circle-check-big",
    color: "success",
    value: data.value.totalResolved,
    percentage: -3.4,
    period: "weekly",
  },
]);
</script>

<template>
  <div class="flex flex-1">
    <UDashboardPanel id="complaints">
      <template #header>
        <DashboardNav :title />
      </template>

      <template #body>
        <div class="p-2 md:p-4">
          <DashboardCardSkeleton v-if="status === 'pending'" />

          <DashboardStatsCard
            v-else
            :cards
          />
        </div>
      </template>
    </UDashboardPanel>
  </div>
</template>

<style>

</style>

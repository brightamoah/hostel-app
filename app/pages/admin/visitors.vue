<script setup lang="ts">
import type { StatsCard } from "~/types";

definePageMeta({
  middleware: ["requires-auth", "admin"],
  layout: "admin-dashboard",
});

const title = ref("Visitors Dashboard");
const globalFilter = ref("");
const tableRef = useTemplateRef("tableRef");

const {
  data,
  status,
  visitors,
  isLoading: refreshIsLoading,
  canResend,
  coolDownTime,
  handleRefresh,
} = useFetchVisitorData();

const cards = computed<StatsCard[]>(() => [
  {
    id: 1,
    title: "Total Visitors",
    icon: "i-lucide-users",
    color: "primary",
    value: data.value.totalVisitors ?? 0,
    percentage: 5.2,
    period: "monthly",
  },
  {
    id: 2,
    title: "Approved Visitors",
    icon: "i-lucide-circle-check-big",
    color: "info",
    value: data.value.approved ?? 0,
    percentage: 8.1,
    period: "monthly",
  },
  {
    id: 3,
    title: "Checked-in Visitors",
    icon: "i-lucide-log-in",
    color: "success",
    value: data.value.checkedIn ?? 0,
    percentage: -3.4,
    period: "weekly",
  },
  {
    id: 4,
    title: "Pending Visitors",
    icon: "i-lucide-clock",
    color: "warning",
    value: data.value.pending ?? 0,
    percentage: 10.0,
    period: "daily",
  },
]);

const {
  dateFilter,
  statusFilter,
  statusFilterOptions,
  dateFilterOptions,
} = useVisitorFilters(tableRef, data);
</script>

<template>
  <div class="flex flex-1">
    <UDashboardPanel id="visitors">
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

          <VisitorSearchFilter
            v-model="globalFilter"
            v-model:status-filter="statusFilter"
            v-model:date-filter="dateFilter"
            :status-filter-options
            :date-filter-options
          >
            <template #actions>
              <DashboardRefreshButton
                :can-resend
                :cool-down-time
                :refresh-is-loading
                :handle-refresh
              />
            </template>
          </VisitorSearchFilter>
        </div>

        <UTable
          ref="tableRef"
          class="mt-6 max-w-[95dvw] md:max-w-full shrink-0"
          row-key="id"
          :data="visitors"
        />
      </template>
    </UDashboardPanel>
  </div>
</template>

<style scoped>

</style>

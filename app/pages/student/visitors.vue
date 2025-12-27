<script setup lang="ts">
import { getPaginationRowModel } from "@tanstack/table-core";

definePageMeta({
  middleware: ["requires-auth"],
  layout: "student-dashboard",
});

const UButton = resolveComponent("UButton");
const UBadge = resolveComponent("UBadge");
const UDropdownMenu = resolveComponent("UDropdownMenu");
const UCheckbox = resolveComponent("UCheckbox");
const UAvatar = resolveComponent("UAvatar");

const title = ref("Student Visitors");
const tableRef = useTemplateRef("tableRef");
const globalFilter = ref("");
const columnVisibility = ref<{ [key: string | number]: boolean }>({ id: false });
const rowSelection = ref({});

const pagination = ref({
  pageIndex: 0,
  pageSize: 10,
});

const {
  data,
  status,
  visitors,
  isLoading: refreshIsLoading,
  canResend,
  coolDownTime,
  handleRefresh,
} = useFetchStudentVisitorData();

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
  currentVisitorShowing,
  lastVisitorShowing,
  totalVisitors,
  selectedVisitorsLength,
  itemsPerPage,
  defaultPage,
  itemsToDisplay,
  updatePage,
} = useVisitorFilters(tableRef, data);

const { columns, getRowItems } = useVisitorRowColumn(
  UAvatar,
  UButton,
  UBadge,
  UDropdownMenu,
  UCheckbox,
);
</script>

<template>
  <div class="flex flex-1">
    <UDashboardPanel id="visitors">
      <template #header>
        <DashboardNav :title />
      </template>

      <template #body>
        <div class="p-2">
          <DashboardCardSkeleton v-if="status === 'pending'" />

          <DashboardStatsCard
            v-else
            :pretty="false"
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
              <VisitorNew />

              <DashboardRefreshButton
                :can-resend
                :cool-down-time
                :refresh-is-loading
                :handle-refresh
              />

              <DashboardItemsToDisplay :items-to-display />
            </template>
          </VisitorSearchFilter>
        </div>

        <UTable
          ref="tableRef"
          v-model:global-filter="globalFilter"
          v-model:pagination="pagination"
          v-model:column-visibility="columnVisibility"
          v-model:row-selection="rowSelection"
          class="mt-6 max-w-[95dvw] md:max-w-full shrink-0"
          :columns
          :get-row-items
          :data="visitors"
          :loading="status === 'pending'"
          :pagination-options="{
            getPaginationRowModel: getPaginationRowModel(),
          }"
          :ui="{
            base: 'table-fixed border-separate border-spacing-0',
            thead: '[&>tr]:bg-elevated/50 [&>tr]:after:content-none',
            tbody: '[&>tr]:last:[&>td]:border-b-0',
            th: 'py-2 first:rounded-l-lg last:rounded-r-lg border-y border-default first:border-l last:border-r',
            td: 'border-b border-default',
          }"
        />

        <DashboardPagination
          v-if="tableRef && tableRef?.tableApi"
          :items="visitors"
          :total-items="totalVisitors"
          :selected-items-length="selectedVisitorsLength"
          :current-items-showing="currentVisitorShowing"
          :last-item-showing="lastVisitorShowing"
          :table="tableRef?.tableApi"
          :default-page
          :items-per-page
          :update-page
        />
      </template>
    </UDashboardPanel>
  </div>
</template>

<style scoped>

</style>

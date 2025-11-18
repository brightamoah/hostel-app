<script setup lang="ts">
import { getPaginationRowModel } from "@tanstack/table-core";

definePageMeta({
  middleware: ["requires-auth", "admin"],
  layout: "admin-dashboard",
});

const UButton = resolveComponent("UButton");
const UBadge = resolveComponent("UBadge");
const UDropdownMenu = resolveComponent("UDropdownMenu");
const UCheckbox = resolveComponent("UCheckbox");
const UAvatar = resolveComponent("UAvatar");

const title = ref("Maintenance Dashboard");
const tableRef = useTemplateRef("tableRef");
const globalFilter = ref("");
const columnVisibility = ref<{ [key: string | number]: boolean }>({ id: false });
const rowSelection = ref({});

const { data, status, maintenanceRequests } = useFetchMaintenanceData();

const cards = computed<StatsCard[]>(() => [
  {
    id: 1,
    title: "Total Requests",
    icon: "i-heroicons-wrench-screwdriver",
    color: "primary",
    value: data.value.totalMaintenance,
    percentage: 5.2,
    period: "monthly",
  },
  {
    id: 2,
    title: "Pending Requests",
    icon: "i-lucide-clock",
    color: "warning",
    value: data.value.pending,
    percentage: 8.1,
    period: "monthly",
  },
  {
    id: 3,
    title: "Completed Requests",
    icon: "i-lucide-circle-check-big",
    color: "success",
    value: data.value.completed,
    percentage: -3.4,
    period: "weekly",
  },
  {
    id: 4,
    title: "In-progress",
    icon: "i-lucide-loader",
    color: "info",
    value: data.value.inProgress,
    percentage: 10.0,
    period: "daily",
  },
]);

const {
  currentMaintenanceShowing,
  defaultPage,
  itemsPerPage,
  totalMaintenance,
  statusFilter,
  statusFilterOptions,
  typeFilter,
  typeFilterOptions,
  priorityFilter,
  priorityFilterOptions,
  selectedMaintenanceLength,
  lastMaintenanceShowing,
  itemsToDisplay,
  // selectedMaintenanceIds,
  updatePage,
} = useMaintenanceFilter(tableRef, data);

const { columns, getRowItems } = useMaintenanceRowColumn(
  UAvatar,
  UButton,
  UBadge,
  UDropdownMenu,
  UCheckbox,
);

const pagination = ref({
  pageIndex: 0,
  pageSize: 10,
});
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

          <DashboardStatsCard
            v-else
            :cards
          />

          <MaintenanceSearchFilter
            v-model="globalFilter"
            v-model:status-filter="statusFilter"
            v-model:type-filter="typeFilter"
            v-model:priority-filter="priorityFilter"
            :status-filter-options
            :type-filter-options
            :priority-filter-options
          >
            <template #actions>
              <DashboardItemsToDisplay :items-to-display />
            </template>
          </MaintenanceSearchFilter>
        </div>

        <UTable
          ref="tableRef"
          :key="maintenanceRequests.length"
          v-model:global-filter="globalFilter"
          v-model:pagination="pagination"
          v-model:row-selection="rowSelection"
          v-model:column-visibility="columnVisibility"
          row-key="id"
          class="mt-6 max-w-[95dvw] md:max-w-full shrink-0"
          :data="maintenanceRequests"
          :columns
          :get-row-items
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
          :items="maintenanceRequests"
          :total-items="totalMaintenance"
          :selected-items-length="selectedMaintenanceLength"
          :current-items-showing="currentMaintenanceShowing"
          :last-item-showing="lastMaintenanceShowing"
          :table="tableRef!.tableApi"
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

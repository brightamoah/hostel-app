<script lang="ts" setup>
import { getPaginationRowModel } from "@tanstack/table-core";

definePageMeta({
  middleware: ["requires-auth"],
  layout: "student-dashboard",
});

const UButton = resolveComponent("UButton");
const UBadge = resolveComponent("UBadge");
const UDropdownMenu = resolveComponent("UDropdownMenu");
const UCheckbox = resolveComponent("UCheckbox");
const UIcon = resolveComponent("UIcon");

const title = "Complaints Dashboard";
const tableRef = useTemplateRef("tableRef");
const globalFilter = ref("");
const columnVisibility = ref<{ [key: string | number]: boolean }>({ id: false });
const rowSelection = ref({});

const {
  data,
  status,
  canResend,
  complaints,
  coolDownTime,
  isLoading: refreshIsLoading,
  handleRefresh,
} = useFetchStudentComplaintData();

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

const {
  statusFilterOptions,
  typeFilterOptions,
  priorityFilterOptions,
  priorityFilter,
  typeFilter,
  statusFilter,
  selectedComplaintLength,
  totalComplaints,
  currentComplaintShowing,
  lastComplaintShowing,
  itemsToDisplay,
  defaultPage,
  itemsPerPage,
  updatePage,
  // selectedComplaintIds,
} = useComplaintFilter(tableRef, data);

const { columns, getRowItems } = useComplaintRowColumn(
  UButton,
  UBadge,
  UDropdownMenu,
  UCheckbox,
  UIcon,
);

const pagination = ref({
  pageIndex: 0,
  pageSize: 10,
});

const hasActiveFilters = computed(() =>
  globalFilter.value
  || statusFilter.value.length > 0
  || typeFilter.value.length > 0
  || priorityFilter.value.length > 0,
);

const description = computed(() => hasActiveFilters.value
  ? "No complaints match your current filters."
  : "There is currently no data to display in this table.",
);
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

          <ComplaintSearchFilter
            v-model="globalFilter"
            v-model:status-filter="statusFilter"
            v-model:type-filter="typeFilter"
            v-model:priority-filter="priorityFilter"
            :status-filter-options
            :type-filter-options
            :priority-filter-options
          >
            <template #actions>
              <ComplaintNew />

              <DashboardRefreshButton
                :can-resend
                :cool-down-time
                :refresh-is-loading
                :handle-refresh
              />

              <DashboardItemsToDisplay :items-to-display />
            </template>
          </ComplaintSearchFilter>
        </div>

        <UTable
          ref="tableRef"
          :key="complaints.length"
          v-model:global-filter="globalFilter"
          v-model:pagination="pagination"
          v-model:row-selection="rowSelection"
          v-model:column-visibility="columnVisibility"
          row-key="id"
          class="mt-6 max-w-[95dvw] md:max-w-full shrink-0"
          :data="complaints"
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
        >
          <template #empty>
            <UEmpty
              variant="naked"
              icon="i-lucide-message-square-warning"
              title="No Complaints Available"
              :description
              size="xl"
              class="flex flex-1 justify-center items-center w-full"
            />
          </template>
        </UTable>

        <DashboardPagination
          v-if="tableRef && tableRef?.tableApi"
          :items="complaints"
          :total-items="totalComplaints"
          :selected-items-length="selectedComplaintLength"
          :current-items-showing="currentComplaintShowing"
          :last-item-showing="lastComplaintShowing"
          :table="tableRef!.tableApi"
          :default-page
          :items-per-page
          :update-page
        />
      </template>
    </UDashboardPanel>
  </div>
</template>

<style>

</style>

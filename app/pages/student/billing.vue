<script setup lang="ts">
import { getPaginationRowModel } from "@tanstack/table-core";

definePageMeta({
  middleware: ["requires-auth"],
  layout: "student-dashboard",
});

const title = "Student Billing";
const table = useTemplateRef("tableRef");
const globalFilter = ref("");
const columnVisibility = ref<{ [key: string | number]: boolean }>({ id: false });
const rowSelection = ref({});

const { user } = useUserSession();

const UButton = resolveComponent("UButton");
const UAvatar = resolveComponent("UAvatar");
const UBadge = resolveComponent("UBadge");
const UDropdownMenu = resolveComponent("UDropdownMenu");

const {
  data,
  billings,
  status,
  canResend,
  coolDownTime,
  isLoading: refreshIsLoading,
  handleRefresh,
} = useFetchBillingDataStudent();

const cards = computed<StatsCard[]>(() => [
  {
    id: 1,
    title: "Total Billings",
    icon: "lucide-wallet",
    color: "primary",
    value: formatCurrency(data.value.totalBillings),
    percentage: 5.2,
    period: "monthly",
  },
  {
    id: 2,
    title: "Total Paid",
    icon: "lucide-circle-check-big",
    color: "success",
    value: formatCurrency(data.value.totalPaid),
    percentage: 8.1,
    period: "monthly",
  },
  {
    id: 3,
    title: "Pending Invoices",
    icon: "lucide-clock",
    color: "warning",
    value: formatCurrency(data.value.totalPending),
    percentage: -3.4,
    period: "weekly",
  },
  {
    id: 4,
    title: "Overdue Payments",
    icon: "lucide-triangle-alert",
    color: "error",
    value: formatCurrency(data.value.totalOverdue),
    percentage: 10.0,
    period: "daily",
  },
]);

const {
  statusFilter,
  statusFilterOptions,
  studentFilter,
  hostelFilter,
  itemsToDisplay,
  totalBillings,
  lastBillingShowing,
  selectedBillingsLength,
  defaultPage,
  currentBillingShowing,
  itemsPerPage,
  updatePage,
} = useBillingFilters(table, data);

const { columns } = useBillingRowColumn(
  UAvatar,
  UButton,
  UBadge,
  UDropdownMenu,
);

const pagination = ref({
  pageIndex: 0,
  pageSize: 10,
});

const hasActiveFilters = computed(() =>
  globalFilter.value
  || statusFilter.value.length > 0
  || hostelFilter.value.length > 0
  || studentFilter.value.length > 0,
);

const description = computed(() => hasActiveFilters.value
  ? "No billings match your current filters."
  : "There is currently no data to display in this table.",
);
</script>

<template>
  <div class="flex flex-1">
    <UDashboardPanel id="student-billing">
      <template #header>
        <DashboardNav :title />
      </template>

      <template #body>
        <DashboardCardSkeleton v-if="status === 'pending'" />

        <DashboardStatsCard
          v-else
          :cards
        >
          <template #value="{ card }">
            <h3 class="font-medium text-xl">
              {{ card.value }}
            </h3>
          </template>
        </DashboardStatsCard>

        <BillingSearchFilter
          v-model="globalFilter"
          v-model:status-filter="statusFilter"
          :user
          :status-filter-options
        >
          <template #actions>
            <DashboardRefreshButton
              :can-resend
              :cool-down-time
              :refresh-is-loading
              :handle-refresh
            />

            <DashboardItemsToDisplay :items-to-display />
          </template>
        </BillingSearchFilter>

        <UTable
          ref="tableRef"
          :key="billings.length"
          v-model:global-filter="globalFilter"
          v-model:pagination="pagination"
          v-model:row-selection="rowSelection"
          v-model:column-visibility="columnVisibility"
          row-key="id"
          class="mt-6 max-w-[95dvw] md:max-w-full shrink-0"
          :data="billings"
          :loading="status === 'pending'"
          :columns
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
              icon="i-lucide-wallet"
              title="No Billings Available"
              :description
              size="xl"
              class="flex flex-1 justify-center items-center w-full"
            />
          </template>
        </UTable>

        <DashboardPagination
          v-if="table && table?.tableApi"
          :items="billings"
          :total-items="totalBillings"
          :selected-items-length="selectedBillingsLength"
          :current-items-showing="currentBillingShowing"
          :last-item-showing="lastBillingShowing"
          :table="table!.tableApi"
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

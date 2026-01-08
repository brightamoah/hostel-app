<script lang="ts" setup>
import { getPaginationRowModel } from "@tanstack/table-core";

definePageMeta({
  middleware: ["requires-auth"],
  layout: "student-dashboard",
});

const title = ref("Student Rooms");

const table = useTemplateRef("tableRef");

const globalFilter = ref("");

const columnVisibility = ref<{ [key: string | number]: boolean }>({ id: false });

const UButton = resolveComponent("UButton");
const UBadge = resolveComponent("UBadge");
const UDropdownMenu = resolveComponent("UDropdownMenu");
const UTooltip = resolveComponent("UTooltip");

const {
  columns,
  getRowItems,
} = useStudentRoomRowColumn(
  UButton,
  UBadge,
  UDropdownMenu,
  UTooltip,
);

const {
  data,
  status,
  rooms,
  isLoading: refreshIsLoading,
  canResend,
  coolDownTime,
  handleRefresh,
} = useFetchStudentRoomData();

const {
  selectedRoomsLength,
  defaultPage,
  itemsPerPage,
  totalRooms,
  statusFilter,
  statusFilterOptions,
  hostelFilter,
  hostelFilterOptions,
  floorFilter,
  floorFilterOptions,
  currentRoomsShowing,
  lastRoomShowing,
  updatePage,
  itemsToDisplay,
} = useStudentRoomFilters(table, data);

const pagination = ref({
  pageIndex: 0,
  pageSize: 10,
});
</script>

<template>
  <div class="flex flex-1">
    <UDashboardPanel id="rooms">
      <template #header>
        <DashboardNav :title />
      </template>

      <template #body>
        <div class="p-2">
          <UCard variant="subtle">
            <RoomSearchFilter
              v-model="globalFilter"
              v-model:status-filter="statusFilter"
              v-model:hostel-filter="hostelFilter"
              v-model:floor-filter="floorFilter"
              class="m-0"
              :status-filter-options
              :hostel-filter-options
              :floor-filter-options
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
            </RoomSearchFilter>
          </UCard>
        </div>

        <UTable
          ref="tableRef"
          :key="rooms.length"
          v-model:global-filter="globalFilter"
          v-model:column-visibility="columnVisibility"
          v-model:pagination="pagination"
          row-key="id"
          class="mt-6 max-w-[95dvw] md:max-w-full shrink-0"
          :columns="columns"
          :data="rooms"
          :get-row-items="getRowItems"
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
              icon="i-lucide-door-open"
              title="No Rooms Available"
              description="There is currently no rooms to display in this table."
              size="xl"
              class="flex flex-1 justify-center items-center w-full"
            />
          </template>
        </UTable>

        <DashboardPagination
          v-if="table && table?.tableApi"
          :items="rooms"
          :total-items="totalRooms"
          :selected-items-length="selectedRoomsLength"
          :current-items-showing="currentRoomsShowing"
          :last-item-showing="lastRoomShowing"
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

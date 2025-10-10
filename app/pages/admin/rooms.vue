<script setup lang="ts">
import { getPaginationRowModel } from "@tanstack/table-core";
import { upperFirst } from "scule";

import type { Room, RoomDataResponse, StatsCard } from "~/types";

definePageMeta({
  middleware: ["requires-auth", "admin"],
  layout: "admin-dashboard",
});
const title = ref("Rooms Management");

const toast = useToast();
const UButton = resolveComponent("UButton");
const UBadge = resolveComponent("UBadge");
const UDropdownMenu = resolveComponent("UDropdownMenu");
const UCheckbox = resolveComponent("UCheckbox");
const UTooltip = resolveComponent("UTooltip");

const table = useTemplateRef("tableRef");

const columnVisibility = ref();

const rowSelection = ref({});

const globalFilter = ref("");

const { data, status } = await useFetch<RoomDataResponse>("/api/room/getRoomData", {
  method: "get",
  key: "roomData",
  lazy: true,
  default: () => ({
    rooms: [],
    totalRooms: 0,
    totalOccupiedRooms: 0,
    totalAvailableRooms: 0,
    totalUnderMaintenance: 0,
    buildings: [],
  }),
});

const rooms = computed<Room[]>(() => {
  const raw = data.value?.rooms ?? [];
  return (raw as any[]).map(r => ({
    ...r,
    features:
      typeof r.features === "string" && r.features
        ? [r.features]
        : Array.isArray(r.features)
          ? r.features
          : [],
  })) as Room[];
});

const cards = computed<StatsCard[]>(() => [
  {
    id: 1,
    title: "Total Rooms",
    icon: "i-lucide-building-2",
    color: "primary",
    value: data.value?.totalRooms ?? 0,
    percentage: 5.2,
    period: "monthly",
  },
  {
    id: 2,
    title: "Occupied Rooms",
    icon: "i-lucide-users",
    color: "info",
    value: data.value?.totalOccupiedRooms ?? 0,
    percentage: 8.1,
    period: "monthly",
  },
  {
    id: 3,
    title: "Available Rooms",
    icon: "i-lucide-check-circle",
    color: "success",
    value: data.value?.totalAvailableRooms ?? 0,
    percentage: -3.4,
    period: "weekly",
  },
  {
    id: 4,
    title: "Under Maintenance",
    icon: "i-heroicons-wrench-screwdriver",
    color: "warning",
    value: data.value?.totalUnderMaintenance ?? 0,
    percentage: 10.0,
    period: "daily",
  },
]);

const { columns, getRowItems } = useRoomRowColumn(
  toast,
  UButton,
  UBadge,
  UDropdownMenu,
  UCheckbox,
  UTooltip,
);

const {
  statusFilter,
  statusFilterOptions,
  buildingFilter,
  buildingFilterOptions,
  floorFilter,
  floorFilterOptions,
} = useRoomFilters(table, data);

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
        <div class="p-2 md:p-4">
          <RoomCardSkeleton v-if="status === 'pending'" />
          <DashboardStatsCard
            v-else
            :cards
          />

          <RoomSearchFilter
            v-model="globalFilter"
            v-model:status-filter="statusFilter"
            v-model:building-filter="buildingFilter"
            v-model:floor-filter="floorFilter"
            :status-filter-options
            :building-filter-options
            :floor-filter-options
          >
            <template #actions>
              <RoomAddModal />

              <UButton
                v-if="table?.tableApi?.getFilteredSelectedRowModel().rows.length"
                label="Delete Selected Rooms"
                icon="i-lucide-trash-2"
                variant="subtle"
                color="error"
                size="lg"
                class="justify-center items-center w-full sm:w-auto cursor-pointer"
              >
                <template #trailing>
                  <UKbd>
                    {{ table?.tableApi?.getFilteredSelectedRowModel().rows.length ?? 0 }}
                  </UKbd>
                </template>
              </UButton>

              <UDropdownMenu
                :items="table?.tableApi
                  ?.getAllColumns()
                  .filter((column: any) => column.getCanHide())
                  .map((column: any) => ({
                    label: upperFirst(column.id),
                    type: 'checkbox' as const,
                    checked: column.getIsVisible(),
                    onUpdateChecked(checked: boolean) {
                      table?.tableApi?.getColumn(column.id)?.toggleVisibility(!!checked)
                    },
                    onSelect(e?: Event) {
                      e?.preventDefault()
                    },
                  }))
                "
                :content="{ align: 'end' }"
              >
                <UButton
                  label="Display"
                  color="neutral"
                  variant="outline"
                  trailing-icon="i-lucide-settings-2"
                  size="lg"
                  class="justify-center items-center w-full sm:w-auto cursor-pointer"
                />
              </UDropdownMenu>
            </template>
          </RoomSearchFilter>
        </div>

        <UTable
          ref="tableRef"
          :key="rooms.length"
          v-model:global-filter="globalFilter"
          v-model:column-visibility="columnVisibility"
          v-model:row-selection="rowSelection"
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
        />

        <div class="flex justify-between items-center gap-3 mt-auto pt-4 border-default border-t">
          <div class="text-muted text-sm">
            <template v-if="table?.tableApi?.getFilteredSelectedRowModel().rows.length">
              {{ table?.tableApi.getFilteredSelectedRowModel().rows.length }} of
              {{ rooms.length }} row(s) selected.
            </template>
            <template v-else-if="rooms.length > 0 && table?.tableApi">
              Showing
              {{ (table!.tableApi.getState().pagination.pageIndex * table!.tableApi.getState().pagination.pageSize) + 1
              }}
              -
              {{ Math.min(
                (table!.tableApi.getState().pagination.pageIndex + 1) * table!.tableApi.getState().pagination.pageSize,
                rooms.length,
              ) }}
              of
              {{ rooms.length }} rows.
            </template>
            <template v-else>
              No data available.
            </template>
          </div>

          <div class="flex items-center gap-1.5">
            <UPagination
              :default-page="(table?.tableApi?.getState().pagination.pageIndex || 0) + 1"
              :items-per-page="table?.tableApi?.getState().pagination.pageSize"
              :total="table?.tableApi?.getFilteredRowModel().rows.length"
              @update:page="(p: number) => table?.tableApi?.setPageIndex(p - 1)"
            />
          </div>
        </div>
      </template>
    </UDashboardPanel>
  </div>
</template>

<style scoped></style>

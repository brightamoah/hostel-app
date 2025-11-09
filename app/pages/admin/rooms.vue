<script setup lang="ts">
import { getPaginationRowModel } from "@tanstack/table-core";

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

const columnVisibility = ref<{ [key: string | number]: boolean }>({ id: false });

const rowSelection = ref({});

const globalFilter = ref("");

const {
  data,
  status,
  rooms,
  isLoading: refreshIsLoading,
  canResend,
  coolDownTime,
  handleRefresh,
} = useFetchRoomData();

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

const {
  columns,
  getRowItems,
} = useRoomRowColumn(
  toast,
  UButton,
  UBadge,
  UDropdownMenu,
  UCheckbox,
  UTooltip,
);

const {
  selectedRoomsLength,
  defaultPage,
  itemsPerPage,
  totalRooms,
  statusFilter,
  statusFilterOptions,
  buildingFilter,
  buildingFilterOptions,
  floorFilter,
  floorFilterOptions,
  currentRoomsShowing,
  lastRoomShowing,
  selectedRoomIds,
  updatePage,
  itemsToDisplay,
} = useRoomFilters(table, data);

const roomStore = useRoomStore();
const { deleteRoom } = roomStore;
const { deleteModalOpen, isLoading } = storeToRefs(roomStore);

async function handleDeleteSelectedRooms() {
  const payload = selectedRoomIds.value;
  if (!payload?.ids?.length)
    return;
  try {
    await deleteRoom(payload);
    deleteModalOpen.value = false;
    try {
      rowSelection.value = {};
      const api = table?.value?.tableApi;
      api?.resetRowSelection?.();
      api?.toggleAllPageRowsSelected?.(false);
    }
    catch (error) {
      console.warn("Failed to clear selection after delete:", error);
    }
  }
  catch (error) {
    // Log error to help with debugging
    console.error("Error deleting selected rooms:", error);
  }
}

const pagination = ref({
  pageIndex: 0,
  pageSize: 10,
});

watch([globalFilter, statusFilter, buildingFilter, floorFilter], () => {
  pagination.value.pageIndex = 0;
});

const description = "Admin Rooms Dashboard Page";
const image = "/images/hostel.jpg";
const url = "https://bkamoah.vercel.app/contact";

useHead({
  titleTemplate: `Kings Hostel Management | ${title.value}`,
  meta: [
    { name: "viewport", content: "width=device-width, initial-scale=1.0" },
    { name: "charset", content: "utf-8" },
    { name: "color-scheme", content: "light dark" },
  ],
  link: [
    { rel: "icon", type: "image/x-icon", href: "/fav.svg" },
    { rel: "canonical", href: url },
  ],
});

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
  ogImage: image,
  ogUrl: url,
  ogType: "website",
  twitterCard: "summary_large_image",
  twitterTitle: title,
  twitterDescription: description,
  twitterImage: image,
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
          <DashboardCardSkeleton v-if="status === 'pending'" />

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
              <DashboardRefreshButton
                :can-resend
                :cool-down-time
                :refresh-is-loading
                :handle-refresh
              />

              <RoomAddModal />

              <DashboardConfirmationModal
                v-if="selectedRoomsLength"
                v-model:open="deleteModalOpen"
                confirm-label="Delete Room"
                render-trigger
                :title="`Delete ${selectedRoomsLength} Rooms`"
                :is-loading
                @confirm="handleDeleteSelectedRooms"
              >
                <template #trigger="{ show }">
                  <UButton
                    label="Delete Selected Rooms"
                    icon="i-lucide-trash-2"
                    variant="subtle"
                    color="error"
                    size="lg"
                    class="justify-center items-center w-full sm:w-auto cursor-pointer"
                    @click="show()"
                  >
                    <template #trailing>
                      <UKbd>
                        {{ selectedRoomsLength }}
                      </UKbd>
                    </template>
                  </UButton>
                </template>

                <template #default>
                  <p class="">
                    Are you sure you want to delete the selected room(s)? This action cannot be
                    undone.
                  </p>
                </template>
              </DashboardConfirmationModal>

              <DashboardItemsToDisplay :items-to-display />
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

<style scoped></style>

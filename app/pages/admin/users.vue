<script setup lang="ts">
import { getPaginationRowModel } from "@tanstack/table-core";

import type { StatsCard } from "~/types";

import { useUserStore } from "~/stores/userStore";

definePageMeta({
  middleware: ["requires-auth", "admin"],
  layout: "admin-dashboard",
});

// const toast = useToast();
const UButton = resolveComponent("UButton");
const UBadge = resolveComponent("UBadge");
const UDropdownMenu = resolveComponent("UDropdownMenu");
const UCheckbox = resolveComponent("UCheckbox");
const UAvatar = resolveComponent("UAvatar");
const UIcon = resolveComponent("UIcon");

const userStore = useUserStore();
const { deleteModalOpen, isLoading } = storeToRefs(userStore);

const title = ref("Users Dashboard");

const globalFilter = ref("");
const userTable = useTemplateRef("userTable");
const columnVisibility = ref<{ [key: string | number]: boolean }>({ id: false });
const rowSelection = ref({});

const {
  data,
  status,
  users,
  isLoading: refreshIsLoading,
  canResend,
  coolDownTime,
  handleRefresh,
} = useFetchUserData();

const { columns, getRowItems } = useUserRowColumn(
  UAvatar,
  UButton,
  UBadge,
  UDropdownMenu,
  UCheckbox,
  UIcon,
);

const cards = computed<StatsCard[]>(() => [
  {
    id: 1,
    title: "Total Users",
    icon: "i-lucide-users",
    color: "primary",
    value: data.value?.totalUsers ?? 0,
    percentage: 5.2,
    period: "monthly",
  },
  {
    id: 2,
    title: "Total Students",
    icon: "i-lucide-graduation-cap",
    color: "success",
    value: data.value?.totalStudents ?? 0,
    percentage: 8.1,
    period: "monthly",
  },
  {
    id: 3,
    title: "Total Admins",
    icon: "i-lucide-monitor",
    color: "error",
    value: data.value?.totalAdmins ?? 0,
    percentage: -3.4,
    period: "weekly",
  },
  {
    id: 4,
    title: "Active Students",
    icon: "i-lucide-house",
    color: "info",
    value: data.value?.activeStudents ?? 0,
    percentage: 10.0,
    period: "daily",
  },
]);

const {
  statusFilter,
  roleFilter,
  statusFilterOptions,
  roleFilterOptions,
  currentUserShowing,
 currentPage,
  itemsPerPage,
  lastUserShowing,
  selectedUserIds,
  selectedUsersLength,
  totalUsers,
  itemsToDisplay,
} = useUserFilters(userTable, data);

const pagination = ref({
  pageIndex: 0,
  pageSize: 10,
});

async function handleDeleteUsers() {
  const payload = selectedUserIds.value;

  if (!payload?.ids?.length)
    return;

  try {
    await userStore.deleteUser(payload);
    deleteModalOpen.value = false;
    try {
      rowSelection.value = {};
      const api = userTable?.value?.tableApi;
      api?.resetRowSelection?.();
      api?.toggleAllPageRowsSelected?.(false);
    }
    catch (error) {
      console.warn("Failed to clear selection after delete:", error);
    }
  }
  catch (error) {
    console.error("Error deleting selected users:", error);
  }
}

watch([globalFilter, statusFilter, roleFilter], () => {
  pagination.value.pageIndex = 0;
});

const description = "Admin Users Dashboard Page";
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
    <UDashboardPanel id="users">
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

          <UserSearchFilter
            v-model="globalFilter"
            v-model:role-filter="roleFilter"
            v-model:status-filter="statusFilter"
            :role-filter-options
            :status-filter-options
          >
            <template #actions>
              <DashboardRefreshButton
                :can-resend
                :cool-down-time
                :refresh-is-loading
                :handle-refresh
              />

              <UserAddAdminModal />

              <DashboardConfirmationModal
                v-if="selectedUsersLength"
                v-model:open="deleteModalOpen"
                confirm-label="Delete Users"
                render-trigger
                :title="`Delete ${selectedUsersLength} Users`"
                :is-loading
                @confirm="handleDeleteUsers"
              >
                <template #trigger="{ show }">
                  <UButton
                    label="Delete Selected User(s)"
                    icon="i-lucide-trash-2"
                    variant="subtle"
                    color="error"
                    size="lg"
                    class="justify-center items-center w-full sm:w-auto cursor-pointer"
                    @click="show()"
                  >
                    <template #trailing>
                      <UKbd>
                        {{ selectedUsersLength }}
                      </UKbd>
                    </template>
                  </UButton>
                </template>

                <template #default>
                  <p class="">
                    Are you sure you want to delete the selected user(s)? This action cannot be
                    undone.
                  </p>
                </template>
              </DashboardConfirmationModal>

              <DashboardItemsToDisplay :items-to-display />
            </template>
          </UserSearchFilter>
        </div>

        <UTable
          ref="userTable"
          v-model:global-filter="globalFilter"
          v-model:pagination="pagination"
          v-model:column-visibility="columnVisibility"
          v-model:row-selection="rowSelection"
          class="mt-6 max-w-[95dvw] md:max-w-full shrink-0"
          row-key="id"
          :columns
          :get-row-items
          :data="users"
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
          v-if="userTable && userTable?.tableApi"
          v-model:page="currentPage"
          :items="users"
          :total-items="totalUsers ?? users.length"
          :selected-items-length="selectedUsersLength"
          :current-items-showing="currentUserShowing"
          :last-item-showing="lastUserShowing"
          :items-per-page
        />
      </template>
    </UDashboardPanel>
  </div>
</template>

<style scoped></style>

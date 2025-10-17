<script setup lang="ts">
import type { StatsCard } from "~/types";

definePageMeta({
  middleware: ["requires-auth", "admin"],
  layout: "admin-dashboard",
});

const toast = useToast();
const UButton = resolveComponent("UButton");
const UBadge = resolveComponent("UBadge");
const UDropdownMenu = resolveComponent("UDropdownMenu");
const UCheckbox = resolveComponent("UCheckbox");
const UTooltip = resolveComponent("UTooltip");
const UAvatar = resolveComponent("UAvatar");
const UIcon = resolveComponent("UIcon");

const title = ref("Users Dashboard");

const { data, status, users } = useFetchUserData();

const { columns, getRowItems } = useUserRowColumn(
  UAvatar,
  UButton,
  UBadge,
  UDropdownMenu,
  UCheckbox,
  UIcon,
  UTooltip,
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
</script>

<template>
  <div class="flex flex-1">
    <UDashboardPanel id="users">
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
        </div>

        <UTable
          class="mt-6 max-w-[95dvw] md:max-w-full shrink-0"
          :columns
          :get-row-items
          :data="users"
        />
      </template>
    </UDashboardPanel>
  </div>
</template>

<style scoped>

</style>

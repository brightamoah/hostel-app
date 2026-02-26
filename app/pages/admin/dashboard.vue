<script setup lang="ts">
definePageMeta({
  middleware: ["requires-auth", "admin"],
  layout: "admin-dashboard",
});

const title = ref("Admin Dashboard");

const {
  cardStats,
  status,
  canResend,
  coolDownTime,
  isLoading: refreshIsLoading,
  overview,
  handleRefresh,
} = useAdminDashboardData();

provide(refreshKey, {
  canResend,
  coolDownTime,
  refreshIsLoading,
  handleRefresh,
});

const cards = computed<StatsCard[]>(() => [
  {
    id: 1,
    title: "Total Residents",
    icon: "i-lucide-users",
    color: "primary",
    value: cardStats.value?.totalResidents.value ?? 0,
    percentage: cardStats.value?.totalResidents.percentage,
    period: "monthly",
  },
  {
    id: 2,
    title: "Bed Occupancy",
    icon: "i-lucide-house",
    color: "info",
    value: `${cardStats.value?.occupancyRate.value ?? 0}%`,
    percentage: cardStats.value?.occupancyRate.totalOccupied,
    period: "monthly",
  },
  {
    id: 3,
    title: "Available Beds",
    icon: "i-lucide-door-open",
    color: "success",
    value: cardStats.value?.availableBeds.value ?? 0,
    percentage: cardStats.value?.availableBeds.percentage,
    period: "monthly",
  },
  {
    id: 4,
    title: "Monthly Revenue",
    icon: "i-lucide-banknote",
    color: "warning",
    value: formatCurrency(cardStats.value?.monthlyRevenue.value ?? 0),
    percentage: cardStats.value?.monthlyRevenue.percentage,
    period: "monthly",
  },
]);

const description = "Admin Dashboard for Kings Hostel Management System. View key metrics, manage rooms, and oversee hostel operations with ease.";
const image = "/images/admin-dashboard.png";
const url = "https://kings-hostel-management-preview.brightamoah.workers.dev/admin/dashboard";

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
    <UDashboardPanel id="home">
      <template #header>
        <DashboardNav :title />
      </template>

      <template #body>
        <DashboardAlert />

        <template v-if="status === 'pending'">
          <DashboardCardSkeleton />

          <DashboardOverviewSkeleton />
        </template>

        <template v-else>
          <DashboardStatsCard :cards>
            <template #description="{ card }">
              <UProgress
                v-if="card.id === 2"
                v-model:model-value="card.percentage"
                :max="cardStats?.occupancyRate.totalCapacity"
                :color="card.color"
              >
                <template #status>
                  <span class="font-medium text-muted text-sm">
                    {{ cardStats?.occupancyRate.totalOccupied || 0 }} of {{ cardStats?.occupancyRate.totalCapacity || 0 }} beds occupied
                  </span>
                </template>
              </UProgress>

              <UProgress
                v-if="card.id === 3"
                v-model:model-value="card.value as number"
                :max="cardStats?.availableBeds.totalCapacity"
                :color="card.color"
              >
                <template #status>
                  <span class="font-medium text-muted text-sm">
                    {{ cardStats?.availableBeds.value || 0 }} of {{ cardStats?.availableBeds.totalCapacity || 0 }} beds available
                  </span>
                </template>
              </UProgress>
            </template>
          </DashboardStatsCard>

          <DashboardOverview
            v-if="overview"
            :overview
          />
        </template>
      </template>
    </UDashboardPanel>
  </div>
</template>

<style scoped></style>

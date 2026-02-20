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
    title: "Room Occupancy",
    icon: "i-lucide-house",
    color: "success",
    value: `${cardStats.value?.occupancyRate.value ?? 0}%`,
    percentage: cardStats.value?.occupancyRate.totalOccupied,
    period: "monthly",
  },
  {
    id: 3,
    title: "Available Rooms",
    icon: "i-lucide-door-open",
    color: "info",
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
</script>

<template>
  <div class="flex flex-1">
    <UDashboardPanel id="home">
      <template #header>
        <DashboardNav :title />
      </template>

      <template #body>
        <DashboardAlert />

        <DashboardCardSkeleton v-if="status === 'pending'" />

        <DashboardStatsCard
          v-else
          :cards
        >
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

        <!-- <DashboardStats
          :period="period"
          :range="range"
        /> -->

        <!-- <HomeStats
          :period="period"
          :range="range"
        />
        <HomeChart
          :period="period"
          :range="range"
        />
        <HomeSales
          :period="period"
          :range="range"
        /> -->
      </template>
    </UDashboardPanel>
  </div>
</template>

<style scoped></style>

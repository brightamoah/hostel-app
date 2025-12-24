<script setup lang="ts">
import { capitalize } from "vue";

definePageMeta({
  middleware: ["requires-auth"],
  layout: "student-dashboard",
});

const title = ref("Student Dashboard");

const { user } = useUserSession();
const userName = computed(() => user.value?.name ?? "Student");

const {
  data,
  status,
  student,
  isLoading: refreshIsLoading,
  canResend,
  coolDownTime,
  handleRefresh,
} = useFetchStudentDashboardData();

const roommates = computed<Roommate[]>(() => {
  return student.value?.allocation?.room?.allocations.filter(allocation => allocation.student.id !== student.value?.id)
    .map(allocation => allocation.student) ?? [];
});

const room = computed(() => student.value?.allocation?.room);

const visitors = computed(() => student.value?.visitors ?? null);

provide(dashboardKey, {
  roommates,
  room,
  visitors,
});

const cards = computed<StatsCard[]>(() => [
  {
    id: 1,
    title: "Room Allocation",
    icon: "i-lucide-house",
    color: "primary",
    value: student.value?.allocation?.room?.roomNumber ?? "Not Allocated",
    percentage: 0,
    period: "monthly",
  },
  {
    id: 2,
    title: "Amount Paid / Due (GH₵)",
    icon: "i-lucide-banknote",
    color: data.value.balance < 0 ? "success" : "error",
    value: `${data.value.totalPaid.toFixed(2)} / ${data.value.balance.toFixed(2)}`,
    percentage: 0,
    period: "monthly",
  },
  {
    id: 3,
    title: "Maintenance Requests",
    icon: "i-heroicons-wrench-screwdriver",
    color: "warning",
    value: data.value.pendingMaintenance,
    percentage: 0,
    period: "daily",
  },
  {
    id: 4,
    title: "Total Visitors",
    icon: "i-lucide-users",
    color: "info",
    value: data.value.totalVisitors,
    percentage: 0,
    period: "weekly",
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
        <DashboardWelcome
          :user-name
          :can-resend
          :cool-down-time
          :refresh-is-loading
          :handle-refresh
        />

        <DashboardCardSkeleton v-if="status === 'pending'" />

        <DashboardStatsCard
          v-else
          :cards
        >
          <template
            v-if="student?.allocation"
            #value="{ card }"
          >
            <p class="font-bold text-highlighted text-lg">
              {{ card.value }}
              <span
                v-if="card.id === 1"
                class="text-primary"
              >({{ capitalize(student?.allocation?.status ?? "") }})</span>

              <span
                v-if="card.id === 3"
                class="text-warning"
              >(Pending)</span>

              <span
                v-if="card.id === 4"
                class="text-info"
              >(Recorded)</span>
            </p>
          </template>

          <template
            v-if="student?.allocation"
            #description="{ card }"
          >
            <span
              v-if="card.id === 1"
              class="block font-normal text-muted text-sm"
            >
              Amount: {{ formatCurrency(Number(student.allocation.room.amountPerYear ?? 0)) }}
            </span>

            <span
              v-if="card.id === 2"
              class="block font-normal text-error text-sm"
            >
              Payment Due
            </span>

            <span
              v-if="card.id === 3"
              class="block font-normal text-muted text-sm"
            >
              Open Issues
            </span>

            <span
              v-if="card.id === 4"
              class="block font-normal text-muted text-sm"
            >
              All time
            </span>
          </template>
        </DashboardStatsCard>

        <StudentCard />

        <div class="p-2 md:p-4">
          hello world
        </div>
      </template>
    </UDashboardPanel>
  </div>
</template>

<style scoped>

</style>

<script setup lang="ts">
import { getLocalTimeZone, today } from "@internationalized/date";

definePageMeta({
  middleware: ["requires-auth", "admin"],
  layout: "admin-dashboard",
});

const title = ref("Admin Dashboard");

const now = today(getLocalTimeZone());
const range = shallowRef<RangeType>({
  start: now.subtract({ days: 14 }).toDate(getLocalTimeZone()),
  end: now.toDate(getLocalTimeZone()),
});

const period = ref<Period>("daily");
</script>

<template>
  <div class="flex flex-1">
    <UDashboardPanel id="home">
      <template #header>
        <DashboardNav :title />

        <UDashboardToolbar>
          <template #left>
            <!-- NOTE: The `-ms-1` class is used to align with the `DashboardSidebarCollapse` button here. -->
            <DashboardDateRangePicker
              v-model="range"
              class="-ms-1"
            />

            <DashboardPeriodSelect
              v-model="period"
              :range
            />
          </template>
        </UDashboardToolbar>
      </template>

      <template #body>
        <DashboardStats
          :period="period"
          :range="range"
        />
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

<script setup lang="ts">
import type { ChartData, ChartOptions, TooltipItem } from "chart.js";

import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PieController,
  PointElement,
  Title,
  Tooltip,
} from "chart.js";
import { Bar, Doughnut, Pie } from "vue-chartjs";

const { overview } = defineProps<{
  overview: Overview;
}>();

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler,
  PieController,
);

const demographicsData = computed<ChartData<"doughnut">>(() => {
  const students = overview?.students;

  return {
    labels: ["Male", "Female"],
    datasets: [
      {
        backgroundColor: [
          "rgb(59, 130, 246)",
          "rgb(236, 72, 153)",
        ],
        hoverBackgroundColor: [
          "rgb(37, 99, 235)",
          "rgb(219, 39, 119)",
        ],
        data: [students?.males || 0, students?.females || 0],
        borderWidth: 2,
        borderColor: "#ffffff",
        hoverOffset: 4,
      },
    ],
  };
});

const demographicsOptions: ChartOptions<"doughnut"> = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: "60%",
  animation: {
    animateScale: true,
    animateRotate: true,
    duration: 1500,
    easing: "easeOutQuart",
  },
  plugins: {
    title: {
      display: true,
      text: "Student Gender Distribution",
      padding: { bottom: 20 },
      font: { size: 18, weight: "bold" },
    },
    legend: {
      position: "bottom",
      labels: {
        usePointStyle: true,
        padding: 20,
        // color: "rgba(156, 163, 175, 0.9)",
      },
    },
    tooltip: {
      callbacks: {
        label: (context: TooltipItem<"doughnut">) => ` ${context.label}: ${context.raw} students`,
      },
    },
  },
};

const revenueData = computed<ChartData<"bar">>(() => {
  const revenueTrend = overview?.revenueTrend || [];

  return {
    labels: revenueTrend.map(t => t.month),
    datasets: [
      {
        label: "Monthly Revenue",
        data: revenueTrend.map(t => t.amount),
        backgroundColor: "#3b82f6",
        borderRadius: 6,
        borderSkipped: false,
        maxBarThickness: 60,
      },
    ],
  };
});

const revenueOptions: ChartOptions<"bar"> = {
  responsive: true,
  maintainAspectRatio: false,
  animation: {
    duration: 1500,
    easing: "easeOutQuart",
    delay: context => context.dataIndex * 100,
  },
  scales: {
    y: {
      beginAtZero: true,
      grid: {
        color: "rgba(156, 163, 175, 0.3)",
        display: true,
      },
      ticks: {
        callback: value => `${formatCurrency(Number(value))}`,
        font: { size: 11 },
      },
    },
    x: {
      grid: {
        display: false,
      },
      ticks: {
        font: { size: 11 },
      },
    },
  },
  plugins: {
    title: {
      display: true,
      text: "Monthly Revenue Trend (Last 6 Months)",
      padding: { bottom: 20 },
      font: { size: 18, weight: "bold" },
    },
    legend: {
      display: false,
    },
    tooltip: {
      backgroundColor: "rgba(0, 0, 0, 0.8)",
      padding: 12,
      cornerRadius: 8,
      callbacks: {
        label: (context: TooltipItem<"bar">) => {
          const rawValue = context.raw as number;
          return ` Revenue: ${formatCurrency(rawValue)}`;
        },
      },
    },
  },
};

const occupancyData = computed<ChartData<"doughnut">>(() => {
  const occ = overview?.occupancy;
  return {
    labels: ["Occupied", "Vacant", "Maintenance"],
    datasets: [
      {
        backgroundColor: ["#ef4444", "#22c55e", "#F59E0B"],
        data: [occ?.occupiedRooms || 0, occ?.vacantRooms || 0, occ?.maintenanceRooms || 0],
        borderWidth: 1,
        borderColor: "#ffffff",
      },
    ],
  };
});

const occupancyOptions: ChartOptions<"doughnut"> = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: "60%",
  plugins: {
    title: { display: true, text: "Room Occupancy", padding: { bottom: 20 }, font: { size: 16, weight: "bold" } },
    legend: { position: "bottom", labels: { usePointStyle: true, padding: 15 } },
  },
};

const financeData = computed<ChartData<"pie">>(() => {
  const fin = overview?.finance;
  return {
    labels: ["Collected", "Outstanding", "Overdue"],
    datasets: [
      {
        backgroundColor: ["#22c55e", "#3b82f6", "#EF4444"],
        data: [fin?.totalCollected || 0, fin?.totalOutstanding || 0, fin?.overdueAmount || 0],
        borderWidth: 2,
        borderColor: "#ffffff",
      },
    ],
  };
});

const financeOptions: ChartOptions<"pie"> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    title: {
      display: true,
      text: "Payment Status",
      padding: { bottom: 20 },
      font: { size: 18, weight: "bold" },
    },
    legend: {
      position: "bottom",
      labels: {
        usePointStyle: true,
        padding: 15,

      },
    },
    tooltip: { callbacks: { label: c => ` ${c.label}: ${formatCurrency(c.raw as number)}` } },
  },
};

const tasksData = computed<ChartData<"bar">>(() => {
  const t = overview?.tasks;
  return {
    labels: ["Complaints", "Maintenance"],
    datasets: [
      {
        label: "Pending",
        data: [t?.pendingComplaints || 0, t?.pendingMaintenance || 0],
        backgroundColor: "#F59E0B",
        borderRadius: 6,
      },
      {
        label: "In Progress",
        data: [t?.inProgressComplaints || 0, t?.inProgressMaintenance || 0],
        backgroundColor: "#3B82F6",
        borderRadius: 6,
      },
      {
        label: "Emergency",
        data: [0, t?.criticalMaintenance || 0],
        backgroundColor: "#EF4444",
        borderRadius: 6,
      },
    ],
  };
});

const tasksOptions: ChartOptions<"bar"> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    title: { display: true, text: "Complaints & Maintenance", padding: { bottom: 20 }, font: { size: 18, weight: "bold" } },
    legend: { position: "bottom" },
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        stepSize: 1,
      },
      grid: {
        display: true,
        color: "rgba(156, 163, 175, 0.3)",
      },
    },
    x: { grid: { display: false } },
  },
};
</script>

<template>
  <UPageGrid class="gap-6 mt-3">
    <UCard class="h-full">
      <div class="relative w-full h-80 min-h-75">
        <Doughnut
          v-if="overview?.students"
          :data="demographicsData"
          :options="demographicsOptions"
        />
      </div>
    </UCard>

    <UCard class="md:col-span-2 h-full">
      <div class="relative w-full h-80 min-h-75">
        <Bar
          v-if="overview?.revenueTrend"
          :data="revenueData"
          :options="revenueOptions"
        />
      </div>
    </UCard>

    <UCard class="h-full">
      <div class="relative w-full h-80 min-h-75">
        <Doughnut
          :data="occupancyData"
          :options="occupancyOptions"
        />
      </div>
    </UCard>

    <UCard class="h-full">
      <div class="relative w-full h-80 min-h-75">
        <Pie
          :data="financeData"
          :options="financeOptions"
        />
      </div>
    </UCard>

    <UCard class="h-full">
      <div class="relative w-full h-80 min-h-75">
        <Bar
          :data="tasksData"
          :options="tasksOptions"
        />
      </div>
    </UCard>
  </UPageGrid>
</template>

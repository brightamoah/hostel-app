<script setup lang="ts">
const stats = [
  {
    label: "Room Status",
    value: "Occupied",
    icon: "i-lucide-bed-double",
    color: "primary",
  },
  {
    label: "Outstanding Balance",
    value: "₵500",
    icon: "i-lucide-wallet",
    color: "warning",
  },
  {
    label: "Complaints",
    value: 2,
    icon: "i-lucide-message-square-warning",
    color: "error",
  },
  {
    label: "Maintenance",
    value: 1,
    icon: "i-lucide-wrench",
    color: "info",
  },
];

const payments = [
  { id: 1, date: "2025-01-10", amount: "₵2000", status: "Paid" },
  { id: 2, date: "2024-01-12", amount: "₵2500", status: "Paid" },
];

const complaints = [
  { id: 1, title: "Broken fan", status: "Pending" },
  { id: 2, title: "Water leakage", status: "Resolved" },
];
</script>

<template>
  <UContainer class="space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <div>
        <h1 class="font-semibold text-2xl">
          Welcome back 👋
        </h1>

        <p class="text-muted">
          Here’s your hostel overview
        </p>
      </div>

      <UButton
        icon="i-lucide-log-out"
        color="neutral"
        variant="outline"
      >
        Logout
      </UButton>
    </div>

    <!-- Stats -->
    <div class="gap-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      <UCard
        v-for="stat in stats"
        :key="stat.label"
        class="flex items-center gap-4"
      >
        <UIcon
          :name="stat.icon"
          :class="`text-${stat.color}-500 text-2xl`"
        />

        <div>
          <p class="text-muted text-sm">
            {{ stat.label }}
          </p>

          <p class="font-semibold text-lg">
            {{ stat.value }}
          </p>
        </div>
      </UCard>
    </div>

    <!-- Main Grid -->
    <div class="gap-6 grid grid-cols-1 lg:grid-cols-3">
      <!-- Room Details -->
      <UCard class="lg:col-span-1">
        <template #header>
          <h2 class="font-semibold">
            Room Details
          </h2>
        </template>

        <ul class="space-y-2 text-sm">
          <li><strong>Room:</strong> B-203</li>

          <li><strong>Type:</strong> Double</li>

          <li><strong>Floor:</strong> 2</li>

          <li><strong>Status:</strong> Partially Occupied</li>

          <li><strong>Fee / Year:</strong> ₵2500</li>
        </ul>

        <template #footer>
          <UButton
            block
            icon="i-lucide-calendar-plus"
          >
            Book / Change Room
          </UButton>
        </template>
      </UCard>

      <!-- Payments -->
      <UCard class="lg:col-span-2">
        <template #header>
          <h2 class="font-semibold">
            Recent Payments
          </h2>
        </template>

        <!-- <UTable
          :rows="payments"
          :columns="[
            { key: 'date', label: 'Date' },
            { key: 'amount', label: 'Amount' },
            { key: 'status', label: 'Status' },
          ]"
        /> -->
      </UCard>

      <!-- Complaints -->
      <UCard class="lg:col-span-3">
        <template #header>
          <h2 class="font-semibold">
            Complaints
          </h2>
        </template>

        <div
          v-for="c in complaints"
          :key="c.id"
          class="flex justify-between py-2 border-b last:border-b-0"
        >
          <span>{{ c.title }}</span>

          <UBadge :color="c.status === 'Resolved' ? 'success' : 'warning'">
            {{ c.status }}
          </UBadge>
        </div>

        <template #footer>
          <UButton
            icon="i-lucide-plus"
            color="primary"
          >
            New Complaint
          </UButton>
        </template>
      </UCard>
    </div>
  </UContainer>
</template>

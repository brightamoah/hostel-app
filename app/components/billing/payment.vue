<script lang="ts" setup>
import type { TableColumn } from "@nuxt/ui";

import { useDateFormat } from "@vueuse/core";

defineProps<{
  payments: Billing["payments"];
}>();

type PaymentRow = Billing["payments"][number];

const paymentDetails = [
  { label: "Bank Name", value: "Ghana Commercial Bank", icon: "i-lucide-landmark", border: true },
  { label: "Account Name", value: "Kings Hostel Mgt", icon: "i-lucide-user", border: true },
  { label: "Account No", value: "1234567890", icon: "i-lucide-hash", border: true },
  { label: "Mobile Money", value: "+233 54 968 4848", icon: "i-lucide-smartphone", border: false },
];

const columns = ref<TableColumn<PaymentRow>[]>([
  {
    accessorKey: "paymentDate",
    header: "Date",
    cell: ({ row }) => {
      const paymentDate = row.original.paymentDate;

      if (!paymentDate) return "-";

      return useDateFormat(new Date(paymentDate), "DD MMM YYYY").value;
    },
  },
  {
    accessorKey: "paymentMethod",
    header: "Method",
    cell: ({ row }) => row.original?.paymentMethod,
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => formatCurrency(Number(row.original?.amount)),
  },
]);
</script>

<template>
  <div class="gap-6 grid grid-cols-1 md:grid-cols-12">
    <UCard
      class="md:col-span-6 ring-1 ring-muted h-full"
      :ui="{ header: 'bg-primary/10 py-3' }"
    >
      <template #header>
        <h6 class="flex items-center gap-2 font-bold text-primary">
          <UIcon
            name="i-lucide-credit-card"
            class="size-4"
          />
          Payment Information
        </h6>
      </template>

      <div class="space-y-3 text-sm">
        <div
          v-for="(item, index) in paymentDetails"
          :key="index"
          class="flex justify-between pb-2"
          :class="{ 'border-b border-muted': item.border }"
        >
          <span class="flex items-center gap-2 text-muted">
            <UIcon
              :name="item.icon"
              class="size-4 text-primary"
            />
            {{ item.label }}:
          </span>

          <span class="font-medium">{{ item.value }}</span>
        </div>
      </div>
    </UCard>

    <UCard
      class="md:col-span-6 ring-1 ring-muted h-full"
      :ui="{ header: 'bg-primary/10 py-3', body: 'p-0 sm:p-0 py-2' }"
    >
      <template #header>
        <h6 class="flex items-center gap-2 font-bold text-primary">
          <UIcon
            name="i-lucide-history"
            class="size-4"
          /> Transaction History
        </h6>
      </template>

      <UTable
        :data="payments"
        :columns="columns"
        :ui="{
          thead: 'bg-muted text-xs uppercase',
          td: 'py-3',
        }"
      >
        <template #empty>
          <UEmpty
            variant="naked"
            icon="i-lucide-wallet"
            title="No Payments Available"
            description="No payments found"
            class="p-2 sm:p-2 lg:p-2"
          />
        </template>
      </UTable>
    </UCard>
  </div>
</template>

<style>

</style>

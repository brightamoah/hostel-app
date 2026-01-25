<script lang="ts" setup>
import { useDateFormat } from "@vueuse/core";

// Props
const { billing } = defineProps<{
  billing: Billing;
}>();

const emit = defineEmits<{
  close: [];
  download: [billing: Billing];
  email: [billing: Billing];
}>();

// Helper for currency formatting
function formatMoney(amount: number | string) {
  return new Intl.NumberFormat("en-GH", {
    style: "currency",
    currency: "GHS",
  }).format(Number(amount));
}

// Computed totals
const subtotal = computed(() => Number(billing.amount));
const lateFee = computed(() => Number(billing.lateFee || 0));
const total = computed(() => subtotal.value + lateFee.value);
const balanceDue = computed(() => total.value - Number(billing.paidAmount));
</script>

<template>
  <UModal
    :ui="{
      content: 'sm:max-w-4xl',
      overlay: 'backdrop-blur-sm',
    }"
  >
    <template #title>
      <div class="flex items-center justify-between px-6 py-5 bg-primary">
        <h4 class="flex items-center gap-2 text-xl font-bold">
          <UIcon
            name="i-lucide-file-text"
            class="size-6"
          />

          <span>Invoice Details</span>
        </h4>

        <UButton
          color="neutral"
          variant="ghost"
          icon="i-lucide-x"
          class="text-white hover:bg-white/10"
          @click="emit('close')"
        />
      </div>
    </template>

    <template #body>
      <UCard
        :ui="{
          body: 'p-0 sm:p-0',
          header: 'p-0 sm:p-0',
          footer: 'p-4 sm:p-6',
          root: 'overflow-hidden',
        }"
      >
        <div class="p-6 space-y-8">
          <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div class="flex items-center gap-4">
              <div class="flex items-center justify-center size-20 bg-primary/10 rounded-full text-primary">
                <AppLogo class="size-12" />
              </div>

              <div>
                <h4 class="text-xl font-bold text-primary">
                  Kings Hostel
                </h4>

                <p class="text-muted flex items-center gap-1 text-sm">
                  <UIcon
                    name="i-lucide-map-pin"
                    class="size-4"
                  />
                  {{ billing.hostel?.address || 'University Campus, Accra, Ghana' }}
                </p>
              </div>
            </div>

            <div class="text-right space-y-3 w-full md:w-auto">
              <div class="flex items-center md:justify-end justify-between gap-3">
                <UBadge
                  color="primary"
                  variant="solid"
                  size="lg"
                  label="INVOICE ID:"
                />

                <h5 class="text-xl font-bold text-primary">
                  {{ billing.invoiceNumber }}
                </h5>
              </div>

              <div class="flex flex-col gap-1 text-sm">
                <div class="flex md:justify-end justify-between items-center gap-2 text-muted">
                  <div class="flex items-center gap-2">
                    <UIcon
                      name="i-lucide-calendar"
                      class="size-4"
                    />

                    <span class="font-medium">Date Issued:</span>
                  </div>

                  <span>{{ useDateFormat(billing.dateIssued, 'MMM DD, YYYY').value }}</span>
                </div>

                <div class="flex md:justify-end justify-between items-center gap-2 text-muted">
                  <div class="flex items-center gap-2">
                    <UIcon
                      name="i-lucide-calendar-clock"
                      class="size-4"
                    />

                    <span class="font-medium">Due Date:</span>
                  </div>

                  <span>{{ useDateFormat(billing.dueDate, 'MMM DD, YYYY').value }}</span>
                </div>
              </div>
            </div>
          </div>

          <USeparator
            type="dashed"
            class="my-6"
          />

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <UCard class="shadow-sm ring-1 ring-gray-200 dark:ring-gray-800 h-full">
              <div class="space-y-4">
                <h5 class="flex items-center gap-2 font-semibold text-sm">
                  <UIcon
                    name="i-lucide-user"
                    class="size-4"
                  />
                  Billed To:
                  <span class="text-primary font-bold uppercase ml-1">{{ billing.student?.user?.name }}</span>
                </h5>

                <div class="text-sm text-muted space-y-2 pl-6">
                  <p class="flex items-center gap-2">
                    <UIcon
                      name="i-lucide-id-card"
                      class="size-4"
                    /> {{ billing.student?.userId }}
                  </p>

                  <p class="flex items-center gap-2">
                    <UIcon
                      name="i-lucide-phone"
                      class="size-4"
                    /> {{ billing.student?.phoneNumber || 'N/A' }}
                  </p>

                  <p class="flex items-center gap-2">
                    <UIcon
                      name="i-lucide-mail"
                      class="size-4"
                    /> {{ billing.student?.user?.email }}
                  </p>
                </div>
              </div>
            </UCard>

            <UCard class="shadow-sm ring-1 ring-gray-200 dark:ring-gray-800 h-full">
              <div class="space-y-4">
                <h5 class="flex items-center gap-2 font-semibold text-sm">
                  <UIcon
                    name="i-lucide-building"
                    class="size-4"
                  />
                  From:
                  <span class="text-primary font-bold uppercase ml-1">Kings Hostel Management</span>
                </h5>

                <div class="text-sm text-muted space-y-2 pl-6">
                  <p class="flex items-center gap-2">
                    <UIcon
                      name="i-lucide-map-pin"
                      class="size-4"
                    /> University Campus, Accra
                  </p>

                  <p class="flex items-center gap-2">
                    <UIcon
                      name="i-lucide-mail"
                      class="size-4"
                    /> kingshostelmgt@gmail.com
                  </p>

                  <p class="flex items-center gap-2">
                    <UIcon
                      name="i-lucide-phone"
                      class="size-4"
                    /> +233 549 684 848
                  </p>
                </div>
              </div>
            </UCard>
          </div>

          <div class="ring-1 ring-gray-200 dark:ring-gray-800 rounded-lg overflow-hidden">
            <table class="w-full text-sm text-left">
              <thead class="bg-primary/10 text-primary uppercase font-bold">
                <tr>
                  <th class="px-6 py-3 w-16">
                    #
                  </th>

                  <th class="px-6 py-3">
                    Description
                  </th>

                  <th class="px-6 py-3 text-right">
                    Amount
                  </th>
                </tr>
              </thead>

              <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
                <tr>
                  <td class="px-6 py-4 font-medium">
                    01
                  </td>

                  <td class="px-6 py-4">
                    {{ billing.description }}
                  </td>

                  <td class="px-6 py-4 text-right font-medium">
                    {{ formatMoney(billing.amount) }}
                  </td>
                </tr>
              </tbody>

              <tfoot class="bg-gray-50/50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-800">
                <tr>
                  <td
                    colspan="2"
                    class="px-6 py-2 text-right text-muted font-semibold"
                  >
                    Subtotal:
                  </td>

                  <td class="px-6 py-2 text-right font-medium">
                    {{ formatMoney(subtotal) }}
                  </td>
                </tr>

                <tr>
                  <td
                    colspan="2"
                    class="px-6 py-2 text-right text-muted font-semibold"
                  >
                    Late Payment Fee (5%):
                  </td>

                  <td class="px-6 py-2 text-right font-medium">
                    {{ formatMoney(lateFee) }}
                  </td>
                </tr>

                <tr class="border-t border-gray-200 dark:border-gray-800">
                  <td
                    colspan="2"
                    class="px-6 py-3 text-right font-bold text-base"
                  >
                    Total:
                  </td>

                  <td class="px-6 py-3 text-right font-bold text-base">
                    {{ formatMoney(total) }}
                  </td>
                </tr>

                <tr>
                  <td
                    colspan="2"
                    class="px-6 py-1 text-right font-bold"
                  >
                    Amount Paid:
                  </td>

                  <td class="px-6 py-1 text-right font-bold text-green-600 dark:text-green-400">
                    {{ formatMoney(billing.paidAmount!) }}
                  </td>
                </tr>

                <tr>
                  <td
                    colspan="2"
                    class="px-6 py-2 text-right font-bold"
                  >
                    Balance Due:
                  </td>

                  <td class="px-6 py-2 text-right font-bold text-orange-500 dark:text-orange-400">
                    {{ formatMoney(balanceDue) }}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div class="md:col-span-7">
              <UCard
                class="h-full shadow-sm ring-1 ring-gray-200 dark:ring-gray-800"
                :ui="{ header: 'bg-primary/10 py-3' }"
              >
                <template #header>
                  <h6 class="font-bold text-primary flex items-center gap-2">
                    <UIcon
                      name="i-lucide-credit-card"
                      class="size-4"
                    /> Payment Information
                  </h6>
                </template>

                <div class="space-y-3 text-sm">
                  <div class="flex justify-between border-b border-gray-100 dark:border-gray-800 pb-2">
                    <span class="text-muted flex items-center gap-2"><UIcon
                      name="i-lucide-landmark"
                      class="text-primary size-4"
                    /> Bank Name:</span>

                    <span class="font-medium">Ghana Commercial Bank</span>
                  </div>

                  <div class="flex justify-between border-b border-gray-100 dark:border-gray-800 pb-2">
                    <span class="text-muted flex items-center gap-2"><UIcon
                      name="i-lucide-user"
                      class="text-primary size-4"
                    /> Account Name:</span>

                    <span class="font-medium">Kings Hostel Management</span>
                  </div>

                  <div class="flex justify-between border-b border-gray-100 dark:border-gray-800 pb-2">
                    <span class="text-muted flex items-center gap-2"><UIcon
                      name="i-lucide-hash"
                      class="text-primary size-4"
                    /> Account No:</span>

                    <span class="font-medium">1234567890</span>
                  </div>

                  <div class="flex justify-between">
                    <span class="text-muted flex items-center gap-2"><UIcon
                      name="i-lucide-smartphone"
                      class="text-primary size-4"
                    /> Mobile Money:</span>

                    <span class="font-medium">+233 54 968 4848</span>
                  </div>
                </div>
              </UCard>
            </div>

            <div class="md:col-span-5">
              <UCard
                class="h-full shadow-sm ring-1 ring-gray-200 dark:ring-gray-800"
                :ui="{ header: 'bg-primary/10 py-3', body: 'p-0' }"
              >
                <template #header>
                  <h6 class="font-bold text-primary flex items-center gap-2">
                    <UIcon
                      name="i-lucide-history"
                      class="size-4"
                    /> Transaction History
                  </h6>
                </template>

                <div
                  v-if="!billing.payments?.length"
                  class="text-sm text-center py-6 text-muted italic"
                >
                  No transactions found.
                </div>

                <div
                  v-else
                  class="overflow-x-auto"
                >
                  <table class="w-full text-sm">
                    <thead class="bg-gray-50 dark:bg-gray-800 text-xs uppercase">
                      <tr>
                        <th class="px-4 py-2 text-left">
                          Date
                        </th>

                        <th class="px-4 py-2 text-right">
                          Amount
                        </th>
                      </tr>
                    </thead>

                    <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
                      <tr
                        v-for="payment in billing.payments"
                        :key="payment.id"
                      >
                        <td class="px-4 py-2">
                          {{ useDateFormat(payment.paymentDate, 'DD/MM/YY').value }}
                        </td>

                        <td class="px-4 py-2 text-right">
                          {{ formatMoney(payment.amount) }}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </UCard>
            </div>
          </div>

          <div class="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-100 dark:border-gray-800">
            <h6 class="font-bold flex items-center gap-2 mb-2 text-sm">
              <UIcon
                name="i-lucide-file-text"
                class="text-primary size-4"
              /> Terms & Conditions
            </h6>

            <ul class="text-xs text-muted space-y-1 pl-6 list-decimal">
              <li>Payment is due within 30 days of invoice date.</li>

              <li>Late payments will incur a 5% penalty fee.</li>

              <li>No refunds will be issued after the academic term begins.</li>
            </ul>
          </div>
        </div>

        <template #footer>
          <div class="flex justify-end gap-3">
            <UButton
              label="Close"
              color="neutral"
              variant="subtle"
              icon="i-lucide-x"
              @click="emit('close')"
            />

            <UButton
              label="Download"
              color="neutral"
              variant="outline"
              icon="i-lucide-download"
              @click="emit('download', billing)"
            />

            <UButton
              label="Email Invoice"
              color="primary"
              variant="solid"
              icon="i-lucide-send"
              @click="emit('email', billing)"
            />
          </div>
        </template>
      </UCard>
    </template>
  </UModal>
</template>

<style>
/* Optional: Ensure table borders look crisp */
table {
  border-collapse: collapse;
}
</style>

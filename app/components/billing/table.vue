<script lang="ts" setup>
defineProps<{
  description: string;
  amount: number;
  subtotal: number;
  lateFee: number;
  paidAmount: number;
  balanceDue: number;
  total: number;
}>();
</script>

<template>
  <div class="rounded-lg ring-1 ring-muted overflow-hidden">
    <div class="overflow-x-auto">
      <table class="w-full min-w-125 sm:min-w-full text-sm text-left">
        <thead class="bg-primary font-bold text-white uppercase">
          <tr>
            <th class="px-3 sm:px-6 py-3 w-16">
              #
            </th>

            <th class="px-3 sm:px-6 py-3">
              Description
            </th>

            <th class="px-3 sm:px-6 py-3 text-right">
              Amount
            </th>
          </tr>
        </thead>

        <tbody class="divide-y divide-muted">
          <tr>
            <td class="px-3 sm:px-6 py-4 font-medium">
              01
            </td>

            <td class="px-3 sm:px-6 py-4">
              {{ description }}
            </td>

            <td class="px-3 sm:px-6 py-4 font-medium text-right whitespace-nowrap">
              {{ formatCurrency(amount) }}
            </td>
          </tr>
        </tbody>

        <tfoot class="bg-muted border-accented border-t">
          <tr>
            <td
              colspan="2"
              class="px-3 sm:px-6 py-2 font-semibold text-muted text-right"
            >
              Subtotal:
            </td>

            <td class="px-3 sm:px-6 py-2 font-medium text-right whitespace-nowrap">
              {{ formatCurrency(subtotal) }}
            </td>
          </tr>

          <tr>
            <td
              colspan="2"
              class="px-3 sm:px-6 py-2 font-semibold text-muted text-right"
            >
              Late Payment Fee (5% per month):
            </td>

            <td class="px-3 sm:px-6 py-2 font-medium text-right whitespace-nowrap">
              {{ formatCurrency(lateFee) }}
            </td>
          </tr>

          <tr class="border-accented border-t">
            <td
              colspan="2"
              class="px-3 sm:px-6 py-3 font-bold text-base text-right"
            >
              Total:
            </td>

            <td class="px-3 sm:px-6 py-3 font-bold text-base text-right whitespace-nowrap">
              {{ formatCurrency(total) }}
            </td>
          </tr>

          <tr>
            <td
              colspan="2"
              class="px-3 sm:px-6 py-1 font-bold text-right"
            >
              Amount Paid:
            </td>

            <td class="px-3 sm:px-6 py-1 font-bold text-success text-right whitespace-nowrap">
              {{ formatCurrency(paidAmount) }}
            </td>
          </tr>

          <tr>
            <td
              colspan="2"
              class="px-3 sm:px-6 py-2 font-bold text-right"
            >
              Balance Due:
            </td>

            <td class="px-3 sm:px-6 py-2 font-bold text-error text-right whitespace-nowrap">
              {{ formatCurrency(balanceDue) }}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  </div>
</template>

<style>

</style>

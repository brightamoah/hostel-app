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
  <div class="ring-1 ring-muted rounded-lg overflow-hidden">
    <div class="overflow-x-auto">
      <table class="w-full text-sm text-left min-w-125 sm:min-w-full">
        <thead class="bg-primary text-white uppercase font-bold">
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

            <td class="px-3 sm:px-6 py-4 text-right font-medium whitespace-nowrap">
              {{ formatCurrency(amount) }}
            </td>
          </tr>
        </tbody>

        <tfoot class="bg-muted border-t border-accented">
          <tr>
            <td
              colspan="2"
              class="px-3 sm:px-6 py-2 text-right text-muted font-semibold"
            >
              Subtotal:
            </td>

            <td class="px-3 sm:px-6 py-2 text-right font-medium whitespace-nowrap">
              {{ formatCurrency(subtotal) }}
            </td>
          </tr>

          <tr>
            <td
              colspan="2"
              class="px-3 sm:px-6 py-2 text-right text-muted font-semibold"
            >
              Late Payment Fee (5% per month):
            </td>

            <td class="px-3 sm:px-6 py-2 text-right font-medium whitespace-nowrap">
              {{ formatCurrency(lateFee) }}
            </td>
          </tr>

          <tr class="border-t border-accented">
            <td
              colspan="2"
              class="px-3 sm:px-6 py-3 text-right font-bold text-base"
            >
              Total:
            </td>

            <td class="px-3 sm:px-6 py-3 text-right font-bold text-base whitespace-nowrap">
              {{ formatCurrency(total) }}
            </td>
          </tr>

          <tr>
            <td
              colspan="2"
              class="px-3 sm:px-6 py-1 text-right font-bold"
            >
              Amount Paid:
            </td>

            <td class="px-3 sm:px-6 py-1 text-right font-bold text-success whitespace-nowrap">
              {{ formatCurrency(paidAmount) }}
            </td>
          </tr>

          <tr>
            <td
              colspan="2"
              class="px-3 sm:px-6 py-2 text-right font-bold"
            >
              Balance Due:
            </td>

            <td class="px-3 sm:px-6 py-2 text-right font-bold text-error whitespace-nowrap">
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

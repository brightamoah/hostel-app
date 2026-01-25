<script lang="ts" setup>
import { useDateFormat } from "@vueuse/core";

defineProps<{
  invoiceNumber: string;
  dateIssued: Date;
  dueDate: string;
  hostelAddress: string;
}>();
</script>

<template>
  <div class="flex flex-col md:flex-row justify-between md:items-center gap-4">
    <div class="space-y-6">
      <div class="flex items-start gap-3">
        <AppLogo class="md:size-16 size-10 shrink-0" />

        <div>
          <h2 class="font-newsreader text-base font-semibold md:text-2xl">
            Kings Hostel
          </h2>

          <p class="flex items-center gap-0.5 text-sm text-muted mt-1">
            <UIcon
              name="i-lucide-map-pin"
              class="size-4 shrink-0"
            />
            {{ hostelAddress }}
          </p>
        </div>
      </div>
    </div>

    <div class="flex flex-col">
      <h3 class="font-medium text-lg">
        Invoice ID: <span class="text-primary"> {{ invoiceNumber }}</span>
      </h3>

      <p class="text-sm flex items-center gap-1 text-muted mt-1">
        <UIcon
          name="i-lucide-calendar-days"
          class="size-4 shrink-0"
        />
        Date Issued: {{ useDateFormat(new Date(dateIssued), 'Do MMMM, YYYY') }}
      </p>

      <p class="text-sm flex items-center gap-1 text-muted mt-1">
        <UIcon
          name="i-lucide-calendar-clock"
          class="size-4 shrink-0"
        />
        Due Date: {{ useDateFormat(new Date(dueDate), 'MMMM DD, YYYY') }}
      </p>
    </div>
  </div>
</template>

<style>

</style>

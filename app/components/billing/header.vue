<script lang="ts" setup>
import { useDateFormat } from "@vueuse/core";

const { status } = defineProps<{
  invoiceNumber: string;
  dateIssued: Date;
  dueDate: string;
  hostelAddress: string;
  status: Billing["status"];
}>();

const billingStatus = computed(() => status);
</script>

<template>
  <div class="flex md:flex-row flex-col justify-between md:items-center gap-4">
    <div class="space-y-6">
      <div class="flex items-start gap-3">
        <AppLogo class="size-10 md:size-16 shrink-0" />

        <div>
          <h2 class="font-newsreader font-semibold text-base md:text-2xl">
            Kings Hostel
          </h2>

          <p class="flex items-center gap-0.5 mt-1 text-muted text-sm">
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

      <p class="flex items-center gap-1 mt-1 text-muted text-sm">
        <UIcon
          name="i-lucide-calendar-days"
          class="size-4 shrink-0"
        />
        Date Issued: {{ useDateFormat(new Date(dateIssued), 'Do MMMM, YYYY') }}
      </p>

      <p class="flex items-center gap-1 mt-1 text-muted text-sm">
        <UIcon
          name="i-lucide-calendar-clock"
          class="size-4 shrink-0"
        />
        Due Date: {{ useDateFormat(new Date(dueDate), 'MMMM DD, YYYY') }}
      </p>

      <p class="flex items-center gap-1 mt-1.5 text-muted text-base">
        <UIcon
          name="i-lucide-badge-check"
          class="size-4 shrink-0"
        />
        Status:
        <UBadge
          :label="billingStatus"
          :color="billingStatusColorMap[billingStatus]"
          variant="subtle"
          size="lg"
        />
      </p>
    </div>
  </div>
</template>

<style>

</style>

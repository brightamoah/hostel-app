<script setup lang="ts">
import type { DateValue } from "@internationalized/date";

const {
  range = false,
  min,
  max,
} = defineProps<{
  min?: DateValue;
  max?: DateValue;
  range?: boolean;
}>();

const isMobile = inject("isMobile", computed(() => false)) as ComputedRef<boolean>;

const modelValue = defineModel<DateModel>("date");
</script>

<template>
  <UInputDate
    v-model="modelValue"
    :min-value="min"
    :max-value="max"
    :size="isMobile ? 'lg' : 'xl'"
    :range
    class="w-full"
  >
    <template #trailing>
      <UPopover>
        <UButton
          color="neutral"
          variant="link"
          :size="isMobile ? 'sm' : 'md'"
          icon="i-lucide-calendar-days"
          aria-label="Select a date"
          class="px-0 cursor-pointer"
        />

        <template #content>
          <UCalendar
            v-model="modelValue"
            :min-value="min"
            :max-value="max"
            :range
            :number-of-months="range ? 2 : 1"
            class="p-2"
          />
        </template>
      </UPopover>
    </template>
  </UInputDate>
</template>

<style scoped>

</style>

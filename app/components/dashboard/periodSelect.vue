<script setup lang="ts">
import { eachDayOfInterval } from "date-fns";

const { range } = defineProps<{
  range: RangeType;
}>();

const model = defineModel<Period>({ required: true });

const days = computed(() => eachDayOfInterval(range));

const periods = computed<Period[]>(() => {
  if (days.value.length <= 8) {
    return [
      "daily",
    ];
  }

  if (days.value.length <= 31) {
    return [
      "daily",
      "weekly",
    ];
  }

  return [
    "weekly",
    "monthly",
  ];
});

// Ensure the model value is always a valid period
watch(periods, () => {
  if (!periods.value.includes(model.value)) model.value = periods.value[0]!;
});
</script>

<template>
  <USelect
    v-model="model"
    :items="periods"
    variant="ghost"
    class="data-[state=open]:bg-elevated cursor-pointer"
    :ui="{ value: 'capitalize',
           itemLabel: 'capitalize',
           trailingIcon: 'group-data-[state=open]:rotate-180 transition-transform duration-200',
    }"
  />
</template>

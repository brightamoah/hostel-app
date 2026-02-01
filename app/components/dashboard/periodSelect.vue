<script setup lang="ts">
const { range } = defineProps<{
  range: RangeType;
}>();

const model = defineModel<Period>({ required: true });

const dayCount = computed(() => {
  if (!range.start || !range.end) return 0;
  const diffTime = Math.abs(range.end.getTime() - range.start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays + 1; // +1 to include both start and end date
});

const periods = computed<Period[]>(() => {
  if (dayCount.value <= 8) {
    return [
      "daily",
    ];
  }

  if (dayCount.value <= 31) {
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

<script setup lang="ts">
import type { Period, Range, Stat } from "~/types";

const props = defineProps<{
  period: Period;
  range: Range;
}>();

function formatCurrency(value: number): string {
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

const baseStats = [{
  title: "Customers",
  icon: "i-lucide-users",
  minValue: 400,
  maxValue: 1000,
  minVariation: -15,
  maxVariation: 25,
  color: "primary",
}, {
  title: "Conversions",
  icon: "i-lucide-chart-pie",
  minValue: 1000,
  maxValue: 2000,
  minVariation: -10,
  maxVariation: 20,
  color: "info",
}, {
  title: "Revenue",
  icon: "i-lucide-circle-dollar-sign",
  minValue: 200000,
  maxValue: 500000,
  minVariation: -20,
  maxVariation: 30,
  color: "success",
  formatter: formatCurrency,
}, {
  title: "Orders",
  icon: "i-lucide-shopping-cart",
  minValue: 100,
  maxValue: 300,
  minVariation: -5,
  maxVariation: 15,
  color: "warning",
}];

const { data: stats } = await useAsyncData<Stat[]>("stats", async () => {
  return baseStats.map((stat) => {
    const value = randomInt(stat.minValue, stat.maxValue);
    const variation = randomInt(stat.minVariation, stat.maxVariation);

    return {
      title: stat.title,
      icon: stat.icon,
      value: stat.formatter ? stat.formatter(value) : value,
      variation,
      color: stat.color,
    };
  });
}, {
  watch: [() => props.period, () => props.range],
  default: () => [],
});
</script>

<template>
  <UPageGrid class="gap-4 sm:gap-6 lg:gap-6 lg:grid-cols-4">
    <UPageCard
      v-for="(stat, index) in stats"
      :key="index"
      :icon="stat.icon"
      :title="stat.title"
      :to="{ name: 'admin-rooms' }"
      variant="subtle"
      :ui="{
        container: 'gap-y-1.5',
        wrapper: 'items-start',
        leading: 'p-2.5 rounded-full bg-primary/10 ring ring-inset ring-primary/25 flex-col',
        title: 'font-normal text-muted text-xs uppercase',
      }"
      class="hover:z-1 border-b-1 hover:border-b-3 first:border-b-error rounded-lg transition-all duration-300 ease-in-out"
      :class="{
        'border-b-primary': stat.color === 'primary',
        'border-b-error': stat.color === 'error',
        'border-b-warning': stat.color === 'warning',
        'border-b-info': stat.color === 'info',
        'border-b-success': stat.color === 'success',
        'border-b-neutral': stat.color === 'neutral',
      }"
    >
      <div class="flex items-center gap-2">
        <span class="font-semibold text-highlighted text-2xl">
          {{ stat.value }}
        </span>

        <UBadge
          :color="stat.variation > 0 ? 'success' : 'error'"
          variant="subtle"
          class="text-xs"
        >
          {{ stat.variation > 0 ? '+' : '' }}{{ stat.variation }}%
        </UBadge>
      </div>
    </UPageCard>
  </UPageGrid>
</template>

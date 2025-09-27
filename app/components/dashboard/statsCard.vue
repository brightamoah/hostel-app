<script setup lang="ts">
import type { StatsCard } from "~/types";

defineProps<{
  cards: StatsCard[];
}>();
</script>

<template>
  <UPageGrid class="gap-4 sm:gap-6 lg:gap-6 lg:grid-cols-4">
    <UCard
      v-for="card in cards"
      :key="card.id"
      variant="subtle"
      class="border-b-1 hover:border-b-4 rounded-xl transition-all duration-300 ease-in-out"
      :class="getColorClass(card.color, 'border-b', 10)"
    >
      <div class="flex justify-between items-center">
        <div class="space-y-2">
          <h3 class="font-semibold text-toned text-base capitalize">
            {{ card.title }}
          </h3>
          <p class="font-bold text-highlighted text-2xl">
            {{ card.value }}
          </p>
          <UBadge
            v-if="card.percentage"
            color="neutral"
            variant="outline"
            class="text-sm"
            :class="card.percentage > 0 ? 'text-green-600' : 'text-red-600'"
          >
            {{ card.percentage > 0 ? '+' : '' }}{{ card.percentage }}% from last {{ card.period }}
          </UBadge>
        </div>
        <UIcon
          :name="card.icon"
          class="size-7"
          :class="getColorClass(card.color, 'text')"
        />
      </div>
    </UCard>
  </UPageGrid>
</template>

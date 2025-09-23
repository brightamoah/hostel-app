<script setup lang="ts">
import type { StatsCard } from "~/types";

defineProps<{
  cards: StatsCard[];
}>();
</script>

<template>
  <UPageGrid class="gap-4 sm:gap-6 lg:gap-6 lg:grid-cols-4">
    <div
      v-for="card in cards"
      :key="card.id"
      class="bg-accented shadow-sm p-6 border-b-1 hover:border-b-3 rounded-xl transition-all duration-300 ease-in-out"
      :class="{
        'border-b-primary': card.color === 'primary',
        'border-b-error': card.color === 'error',
        'border-b-warning': card.color === 'warning',
        'border-b-info': card.color === 'info',
        'border-b-success': card.color === 'success',
        'border-b-neutral': card.color === 'neutral',
      }"
    >
      <div class="flex justify-between items-center mb-4">
        <div>
          <h3 class="font-semibold text-gray-900 dark:text-white text-lg">
            {{ card.title }}
          </h3>
          <p class="font-bold text-gray-700 dark:text-gray-300 text-3xl">
            {{ card.value }}
          </p>
          <p
            v-if="card.percentage"
            class="text-sm"
            :class="card.percentage > 0 ? 'text-green-600' : 'text-red-600'"
          >
            {{ card.percentage > 0 ? '+' : '' }}{{ card.percentage }}% from last {{ card.period }}
          </p>
        </div>
        <UIcon
          :name="card.icon"
          class="size-10 text-muted"
        />
      </div>
    </div>
  </UPageGrid>
</template>

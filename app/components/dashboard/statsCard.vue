<script setup lang="ts">
const { cards } = defineProps<{
  cards: StatsCard[];
}>();
</script>

<template>
  <UPageGrid class="gap-4 sm:gap-6 lg:gap-6 lg:grid-cols-4">
    <UCard
      v-for="card in cards"
      :key="card.id"
      variant="subtle"
      class="border-b hover:border-b-[2.5px] rounded-xl transition-all duration-300 ease-in-out cursor-pointer"
      :class="getColorClass(card.color, 'border-b', 10)"
    >
      <div class="flex justify-between items-center">
        <div class="space-y-2">
          <slot
            name="title"
            :card
          >
            <h3 class="font-semibold text-toned text-base capitalize">
              {{ card.title }}
            </h3>
          </slot>

          <slot
            name="value"
            :card
          >
            <p class="font-bold text-highlighted text-2xl">
              {{ card.value }}
            </p>
          </slot>

          <slot
            name="description"
            :card
          >
            <UBadge
              v-if="card.percentage"
              color="neutral"
              variant="outline"
              class="text-sm"
              :class="card.percentage > 0 ? 'text-green-600' : 'text-red-600'"
            >
              {{ card.percentage > 0 ? '+' : '' }}{{ card.percentage }}% from last {{ card.period }}
            </UBadge>
          </slot>
        </div>

        <slot
          name="icon"
          :card
        >
          <UIcon
            :name="card.icon"
            class="size-7"
            :class="getColorClass(card.color, 'text')"
          />
        </slot>
      </div>
    </UCard>
  </UPageGrid>
</template>

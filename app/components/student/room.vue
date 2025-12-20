<script setup lang="ts">
import { capitalize } from "vue";

defineProps<{
  roomDetails: {
    label: string;
    value: string;
    icon: string;
  }[];
  roomVal: StudentRoom;
}>();
</script>

<template>
  <div>
    <div
      v-if="roomVal"
      class="items-center grid grid-cols-2 -mt-6 text-base"
    >
      <ul class="space-y-1">
        <li
          v-for="detail in roomDetails"
          :key="detail.label"
        >
          <UIcon
            :name="detail.icon"
            class="size-4.5 text-primary"
          />
          {{ capitalize(detail.label) }}
        </li>
      </ul>

      <ul class="space-y-1">
        <li
          v-for="detail in roomDetails"
          :key="detail.label"
        >
          {{ capitalize(detail.value) }}
        </li>
      </ul>
    </div>

    <UEmpty
      v-else
      variant="naked"
      icon="i-lucide-house"
      title="No room allocated"
      description="You have not been allocated a room yet"
      size="xl"
      class="flex flex-1 justify-center items-center"
    />
  </div>
</template>

<style scoped>

</style>

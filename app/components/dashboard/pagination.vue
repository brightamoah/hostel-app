<script setup lang="ts" generic="T extends object">
import type { Table } from "@tanstack/table-core";

const { totalItems, page, itemsPerPage, items } = defineProps<{
  items: T[];
  table?: Table<T>;
  totalItems: number;
  selectedItemsLength: number;
  currentItemsShowing: number;
  lastItemShowing: number;
  page?: number;
  itemsPerPage?: number;
}>();

const emit = defineEmits<{
  "update:page": [ page: number];
}>();

const displayTotal = computed(() => totalItems ?? items.length);
</script>

<template>
  <div class="flex justify-between items-center gap-3 mt-auto pt-4 border-default border-t">
    <div class="text-muted text-sm">
      <template v-if="selectedItemsLength">
        {{ selectedItemsLength }} of
        {{ displayTotal }} row(s) selected.
      </template>

      <template v-else-if="items.length > 0">
        Showing
        {{ currentItemsShowing }}
        -
        {{ lastItemShowing }}
        of
        {{ displayTotal }} rows.
      </template>

      <template v-else>
        No data available.
      </template>
    </div>

    <div class="flex items-center gap-1.5">
      <UPagination
        :model-value="page"
        :items-per-page
        :total="displayTotal"
        @update:page="emit('update:page', $event)"
      />
    </div>
  </div>
</template>

<style scoped>

</style>

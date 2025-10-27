<script setup lang="ts" generic="T extends object">
import type { Table } from "@tanstack/table-core";

const { table, totalItems, defaultPage = 1, itemsPerPage = 10 } = defineProps<{
  items: T[];
  table?: Table<T>;
  totalItems: number;
  selectedItemsLength: number;
  currentItemsShowing: number;
  lastItemShowing: number;
  defaultPage?: number;
  itemsPerPage?: number;
  updatePage: (page: number) => void;
}>();

const displayTotal = computed(() => {
  if (table)
    return table.getFilteredRowModel().rows.length;
  return totalItems;
});
</script>

<template>
  <div class="flex justify-between items-center gap-3 mt-auto pt-4 border-default border-t">
    <div class="text-muted text-sm">
      <template v-if="selectedItemsLength">
        {{ selectedItemsLength }} of
        {{ displayTotal }} row(s) selected.
      </template>

      <template v-else-if="items.length > 0 && table">
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
        :page="defaultPage"
        :items-per-page
        :total="displayTotal"
        @update:page="updatePage"
      />
    </div>
  </div>
</template>

<style scoped>

</style>

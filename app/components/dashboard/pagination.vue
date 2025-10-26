<script setup lang="ts" generic="T extends object">
import type { Table } from "@tanstack/table-core";

const { table, totalRooms } = defineProps<{
  rooms: T[];
  table?: Table<T>;
  totalRooms: number;
  selectedRoomsLength: number;
  currentRoomsShowing: number;
  lastRoomShowing: number;
  defaultPage: number;
  itemsPerPage: number;
  updatePage: (page: number) => void;
}>();

const displayTotal = computed(() => {
  if (table)
    return table.getFilteredRowModel().rows.length;
  return totalRooms;
});
</script>

<template>
  <div class="flex justify-between items-center gap-3 mt-auto pt-4 border-default border-t">
    <div class="text-muted text-sm">
      <template v-if="selectedRoomsLength">
        {{ selectedRoomsLength }} of
        {{ displayTotal }} row(s) selected.
      </template>

      <template v-else-if="rooms.length > 0 && table">
        Showing
        {{ currentRoomsShowing }}
        -
        {{ lastRoomShowing }}
        of
        {{ displayTotal }} rows.
      </template>

      <template v-else>
        No data available.
      </template>
    </div>

    <div class="flex items-center gap-1.5">
      <UPagination
        :default-page
        :items-per-page
        :total="displayTotal"
        @update:page="updatePage"
      />
    </div>
  </div>
</template>

<style scoped>

</style>

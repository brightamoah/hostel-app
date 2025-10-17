<script setup lang="ts">
import type { FilterOption } from "~/types";

const {
  modelValue,
  statusFilter,
  statusFilterOptions,
  roleFilter,
  roleFilterOptions,
} = defineProps<{
  modelValue: string;
  statusFilter: string;
  statusFilterOptions: FilterOption[];
  roleFilter: string;
  roleFilterOptions: FilterOption[];
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: string): void;
  (e: "update:statusFilter", value: string): void;
  (e: "update:roleFilter", value: string): void;
}>();

const globalFilterModel = computed({
  get: () => modelValue,
  set: (val: string) => emit("update:modelValue", val),
});

const statusFilterModel = computed({
  get: () => statusFilter,
  set: (val: string) => emit("update:statusFilter", val),
});

const roleFilterModel = computed({
  get: () => roleFilter,
  set: (val: string) => emit("update:roleFilter", val),
});
</script>

<template>
  <div class="md:flex md:justify-between md:items-center md:gap-4 space-y-4 md:space-y-0 mt-10">
    <UInput
      v-model="globalFilterModel"
      class="w-full md:max-w-sm"
      icon="i-lucide-search"
      placeholder="Search users..."
      size="xl"
    />

    <div class="flex sm:flex-row flex-col gap-3 md:gap-4">
      <USelect
        v-model="statusFilterModel"
        arrow
        placeholder="Filter by Status"
        class="w-full sm:min-w-40 text-center cursor-pointer"
        size="xl"
        :items="statusFilterOptions"
        :ui="{
          trailingIcon: 'group-data-[state=open]:rotate-180 transition-transform duration-200',
          item: 'cursor-pointer',
        }"
      />

      <USelect
        v-model="roleFilterModel"
        arrow
        placeholder="Filter by Role"
        class="w-full sm:min-w-40 text-center cursor-pointer"
        size="xl"
        :items="roleFilterOptions"
        :ui="{
          trailingIcon: 'group-data-[state=open]:rotate-180 transition-transform duration-200',
          item: 'cursor-pointer',
        }"
      />
    </div>

    <div class="flex sm:flex-row flex-col gap-3 md:gap-4">
      <slot name="actions" />
    </div>
  </div>
</template>

<style scoped>

</style>

<script setup lang="ts">
const props = defineProps<{
  modelValue: string;
  statusFilter: string;
  statusFilterOptions: FilterOption[];
  hostelFilter: string;
  hostelFilterOptions: FilterOption[];
  floorFilter: string | number;
  floorFilterOptions: FilterOption[];
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: string): void;
  (e: "update:statusFilter", value: string): void;
  (e: "update:hostelFilter", value: string): void;
  (e: "update:floorFilter", value: string | number): void;
}>();

const globalFilterModel = computed({
  get: () => props.modelValue,
  set: (val: string) => emit("update:modelValue", val),
});
const statusFilterModel = computed({
  get: () => props.statusFilter,
  set: (val: string) => emit("update:statusFilter", val),
});
const hostelFilterModel = computed({
  get: () => props.hostelFilter,
  set: (val: string) => emit("update:hostelFilter", val),
});
const floorFilterModel = computed({
  get: () => props.floorFilter,
  set: (val: string | number) => emit("update:floorFilter", val),
});
</script>

<template>
  <div class="md:flex md:justify-between md:items-center md:gap-4 space-y-4 md:space-y-0 mt-10">
    <UInput
      v-model="globalFilterModel"
      class="w-full md:max-w-sm"
      icon="i-lucide-search"
      placeholder="Search rooms..."
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
        v-model="hostelFilterModel"
        arrow
        placeholder="Filter by Hostel"
        size="xl"
        class="w-full sm:min-w-40 text-center cursor-pointer"
        :items="hostelFilterOptions"
        :ui="{
          trailingIcon: 'group-data-[state=open]:rotate-180 transition-transform duration-200',
          item: 'cursor-pointer',
        }"
      />

      <USelect
        v-model="floorFilterModel"
        arrow
        placeholder="Filter by Floor"
        size="xl"
        class="w-full sm:min-w-40 text-center cursor-pointer"
        :items="floorFilterOptions"
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

<script setup lang="ts">
const {
  modelValue,
  statusFilter,
  statusFilterOptions,
  priorityFilter,
  priorityFilterOptions,
  typeFilter,
  typeFilterOptions,
  studentFilter,
  studentFilterOptions,
} = defineProps<{
  modelValue: string;
  statusFilter: string;
  statusFilterOptions: FilterOption[];
  priorityFilter: string;
  priorityFilterOptions: FilterOption[];
  typeFilter: string;
  typeFilterOptions: FilterOption[];
  studentFilter?: string;
  studentFilterOptions?: FilterOption[];
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: string): void;
  (e: "update:statusFilter", value: string): void;
  (e: "update:priorityFilter", value: string): void;
  (e: "update:typeFilter", value: string): void;
  (e: "update:studentFilter", value: string): void;
}>();

const { user } = useUserSession();

const globalFilterModel = computed({
  get: () => modelValue,
  set: (val: string) => emit("update:modelValue", val),
});

const statusFilterModel = computed({
  get: () => statusFilter,
  set: (val: string) => emit("update:statusFilter", val),
});

const priorityFilterModel = computed({
  get: () => priorityFilter,
  set: (val: string) => emit("update:priorityFilter", val),
});

const typeFilterModel = computed({
  get: () => typeFilter,
  set: (val: string) => emit("update:typeFilter", val),
});

const studentFilterModel = computed({
  get: () => studentFilter,
  set: (val: string) => emit("update:studentFilter", val),
});
</script>

<template>
  <div class="md:flex md:justify-between md:items-center md:gap-4 space-y-4 md:space-y-0 mt-10">
    <UInput
      v-model="globalFilterModel"
      class="w-full md:max-w-sm"
      icon="i-lucide-search"
      placeholder="Search Maintenance..."
      size="xl"
    />

    <div class="flex sm:flex-row flex-col gap-3 md:gap-4">
      <USelect
        v-model="typeFilterModel"
        arrow
        placeholder="Filter by Type"
        class="w-full sm:min-w-40 text-center cursor-pointer"
        size="xl"
        :items="typeFilterOptions"
        :ui="{
          trailingIcon: 'group-data-[state=open]:rotate-180 transition-transform duration-200',
          item: 'cursor-pointer',
        }"
      />

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
        v-model="priorityFilterModel"
        arrow
        placeholder="Filter by Priority"
        class="w-full sm:min-w-40 text-center cursor-pointer"
        size="xl"
        :items="priorityFilterOptions"
        :ui="{
          trailingIcon: 'group-data-[state=open]:rotate-180 transition-transform duration-200',
          item: 'cursor-pointer',
        }"
      />

      <USelectMenu
        v-if="studentFilterOptions && user?.role === 'admin'"
        v-model="studentFilterModel"
        arrow
        placeholder="Filter by Student"
        class="w-full sm:min-w-40 text-center cursor-pointer"
        size="xl"
        value-key="value"
        :items="studentFilterOptions"
        :ui="{
          trailingIcon: 'group-data-[state=open]:rotate-180 transition-transform duration-200',
          item: 'cursor-pointer',
        }"
      />
    </div>

    <div
      v-auto-animate
      class="flex sm:flex-row flex-col gap-3 md:gap-4"
    >
      <slot name="actions" />
    </div>
  </div>
</template>

<style scoped>

</style>

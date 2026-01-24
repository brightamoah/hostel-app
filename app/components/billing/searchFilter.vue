<script lang="ts" setup>
import type { User } from "#auth-utils";

defineProps<{
  modelValue: string;
  statusFilterOptions: FilterOption[];
  studentFilterOptions: FilterOption[];
  hostelFilterOptions: FilterOption[];
  user: User | null;
}>();

const globalFilter = defineModel({ required: true, type: String });

const statusFilter = defineModel<string>("statusFilter", { required: true });

const studentFilter = defineModel<string>("studentFilter", { required: true });

const hostelFilter = defineModel<string>("hostelFilter", { required: false });
</script>

<template>
  <div class="md:flex md:justify-between md:items-center md:gap-4 space-y-4 md:space-y-0">
    <UInput
      v-model="globalFilter"
      placeholder="Search billings..."
      size="lg"
      icon="lucide-search"
      class="w-full md:max-w-sm"
    />

    <div class="flex sm:flex-row flex-col gap-3 md:gap-4">
      <USelectMenu
        v-model="statusFilter"
        arrow
        placeholder="Filter by Status"
        class="w-full sm:min-w-40 text-center cursor-pointer"
        size="xl"
        clear
        value-key="value"
        :items="statusFilterOptions"
        :ui="{
          trailingIcon: 'group-data-[state=open]:rotate-180 transition-transform duration-200',
          item: 'cursor-pointer',
        }"
      />

      <USelectMenu
        v-model="studentFilter"
        arrow
        placeholder="Filter by Student"
        class="w-full sm:min-w-40 text-center cursor-pointer"
        size="xl"
        clear
        value-key="value"
        :items="studentFilterOptions"
        :ui="{
          trailingIcon: 'group-data-[state=open]:rotate-180 transition-transform duration-200',
          item: 'cursor-pointer',
        }"
      />

      <USelectMenu
        v-if="user?.role === 'admin' && user?.adminData?.accessLevel === 'super'"
        v-model="hostelFilter"
        arrow
        placeholder="Filter by Hostel"
        class="w-full sm:min-w-40 text-center cursor-pointer"
        size="xl"
        clear
        value-key="value"
        :items="hostelFilterOptions"
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

<style>

</style>

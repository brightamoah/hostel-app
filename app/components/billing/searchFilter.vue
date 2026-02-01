<script lang="ts" setup>
import type { User } from "#auth-utils";

defineProps<{
  modelValue: string;
  statusFilterOptions: FilterOption[];
  studentFilterOptions?: FilterOption[];
  hostelFilterOptions?: FilterOption[];
  user: User | null;
}>();

const globalFilter = defineModel({ required: true, type: String });

const statusFilter = defineModel<string>("statusFilter", { required: true });

const studentFilter = defineModel<string>("studentFilter", { required: false });

const hostelFilter = defineModel<string>("hostelFilter", { required: false });
</script>

<template>
  <div class="flex flex-col lg:flex-row gap-4 w-full">
    <UInput
      v-model="globalFilter"
      placeholder="Search billings..."
      size="lg"
      icon="lucide-search"
      class="w-full lg:flex-1 lg:max-w-md"
    />

    <div class="flex flex-col sm:flex-row gap-3 flex-1">
      <USelectMenu
        v-model="statusFilter"
        arrow
        placeholder="Filter by Status"
        class="w-full flex-1 text-center cursor-pointer"
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
        v-if="user?.role === 'admin'"
        v-model="studentFilter"
        arrow
        placeholder="Filter by Student"
        class="w-full flex-1 text-center cursor-pointer"
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
        class="w-full flex-1 text-center cursor-pointer"
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
      class="flex flex-col sm:flex-row gap-3 lg:shrink-0"
    >
      <slot name="actions" />
    </div>
  </div>
</template>

<style scoped>
</style>

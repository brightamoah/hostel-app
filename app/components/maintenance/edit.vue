<script lang="ts" setup>
import type { FormErrorEvent } from "@nuxt/ui";

const { editMaintenanceState, clearState } = defineProps<{
  editMaintenanceState: MaintenanceEdit["data"];
  isLoading: boolean | Ref<boolean>;
  editMaintenance: () => Promise<void>;
  handleFormError: (event: FormErrorEvent) => void;
  clearState: () => void;
}>();

const {
  student,
} = useFetchStudentDashboardData();

const editMaintenanceFormRef = useTemplateRef("editMaintenanceFormRef");

const editState = ref<MaintenanceEdit["data"]>(editMaintenanceState);

onUnmounted(() => {
  clearState();
});
</script>

<template>
  <UModal
    title="Edit Maintenance Request"
    description="Modify the details of the maintenance request below."
    :dismissible="false"
    :ui="{
      footer: 'justify-end',
      content: 'max-w-3xl  rounded-lg shadow-lg ring ring-default overflow-hidden',
      title: 'font-newsreader text-xl font-semibold',
      close: 'cursor-pointer',
    }"
  >
    <template #body>
      <MaintenanceForm
        ref="editMaintenanceFormRef"
        v-model:state="editState"
        :schema="editMaintenanceSchema.shape.data"
        :student
        @submit="editMaintenance"
        @error="handleFormError"
      />
    </template>

    <template #footer="{ close }">
      <div class="flex gap-2.5">
        <UButton
          label="Cancel"
          color="error"
          variant="outline"
          class="cursor-pointer"
          @click="close"
        />

        <UButton
          :label="isLoading ? 'Submitting...' : 'Submit'"
          color="primary"
          icon="i-lucide-send"
          class="cursor-pointer"
          :loading="unref(isLoading)"
          @click="editMaintenanceFormRef?.maintenanceForm?.submit()"
        />
      </div>
    </template>
  </UModal>
</template>

<style scoped>

</style>

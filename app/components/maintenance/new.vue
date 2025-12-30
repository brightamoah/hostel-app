<script lang="ts" setup>
const {
  student,
} = useFetchStudentDashboardData();

const maintenanceStore = useMaintenanceStore();
const {
  createMaintenanceState,
  isCreateModalOpen,
  isLoading,
} = storeToRefs(maintenanceStore);

const { createMaintenance } = maintenanceStore;

const createMaintenanceFormRef = useTemplateRef("createMaintenanceFormRef");
</script>

<template>
  <UModal
    v-model:open="isCreateModalOpen"
    title="Create Maintenance Request"
    description="Fill out the form below to create a new maintenance request."
    :dismissible="false"
    :ui="{
      footer: 'justify-end',
      content: 'max-w-3xl  rounded-lg shadow-lg ring ring-default overflow-hidden',
      title: 'font-newsreader text-xl font-semibold',
      close: 'cursor-pointer',
    }"
  >
    <UButton
      label="New Maintenance"
      icon="i-lucide-plus"
      variant="solid"
      color="primary"
      size="lg"
      class="justify-center items-center cursor-pointer"
    />

    <template #body>
      <MaintenanceForm
        ref="createMaintenanceFormRef"
        v-model:state="createMaintenanceState"
        :schema="createMaintenanceSchema"
        :student
        @submit="createMaintenance"
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
          :loading="isLoading"
          @click="createMaintenanceFormRef?.maintenanceForm?.submit()"
        />
      </div>
    </template>
  </UModal>
</template>

<style scoped>

</style>

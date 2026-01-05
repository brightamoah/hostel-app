<script setup lang="ts">
const complaintStore = useComplaintStore();

const {
  createComplaintState,
  isLoading,
  isCreateModalOpen,
} = storeToRefs(complaintStore);

const {
  handleFormError,
  createComplaint,
} = complaintStore;

const {
  status,
  roomsInHostel,
  student,
} = useFetchStudentDashboardData();

const createComplaintFormRef = useTemplateRef("createComplaintFormRef");
</script>

<template>
  <UModal
    v-model:open="isCreateModalOpen"
    title="Create New Complaint"
    description="Fill out the form below to create a new complaint."
    :dismissible="false"
    :ui="{
      footer: 'justify-end',
      content: 'max-w-3xl  rounded-lg shadow-lg ring ring-default overflow-hidden',
      title: 'font-newsreader text-xl font-semibold',
      close: 'cursor-pointer',
    }"
  >
    <UButton
      label="New Complaint"
      icon="i-lucide-message-square-plus"
      variant="solid"
      color="primary"
      size="lg"
      class="justify-center items-center cursor-pointer"
    />

    <template #body>
      <ComplaintForm
        ref="createComplaintFormRef"
        :state="createComplaintState"
        :schema="createComplaintSchema"
        :status
        :rooms-in-hostel
        :student
        @submit="createComplaint"
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
          :loading="isLoading"
          @click="createComplaintFormRef?.complaintForm?.submit()"
        />
      </div>
    </template>
  </UModal>
</template>

<style scoped>

</style>

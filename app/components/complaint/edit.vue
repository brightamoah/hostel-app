<script setup lang="ts">
import type { FormErrorEvent } from "@nuxt/ui";

const { editComplaintState, clearState } = defineProps<{
  editComplaintState: Partial<ComplaintInsert>;
  isLoading: boolean | Ref<boolean>;
  editComplaint: () => Promise<void>;
  handleFormError: (event: FormErrorEvent) => void;
  clearState: () => void;
}>();

const editComplaintFormRef = useTemplateRef("editComplaintFormRef");

const editState = ref<Partial<ComplaintInsert>>(editComplaintState);

const {
  status,
  roomsInHostel,
  student,
} = useFetchStudentDashboardData();

onUnmounted(() => {
  clearState();
});
</script>

<template>
  <UModal
    title="Edit Complaint"
    description="Modify the details of the complaint below."
    :dismissible="false"
    :ui="{
      footer: 'justify-end',
      content: 'max-w-3xl  rounded-lg shadow-lg ring ring-default overflow-hidden',
      title: 'font-newsreader text-xl font-semibold',
      close: 'cursor-pointer',
    }"
  >
    <template #body>
      <ComplaintForm
        ref="editComplaintFormRef"
        :state="editState"
        :schema="editComplaintSchema.shape.data"
        :status
        :rooms-in-hostel
        :student
        @submit="editComplaint"
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
          @click="editComplaintFormRef?.complaintForm?.submit()"
        />
      </div>
    </template>
  </UModal>
</template>

<style scoped>

</style>

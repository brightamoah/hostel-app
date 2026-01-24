<script setup lang="ts">
const { complaint, action, isLoading } = defineProps<{
  complaint: Complaint;
  action: ComplaintAction;
  isLoading: boolean | Ref<boolean>;
  update?: () => Promise<void>;
  addResponse?: () => Promise<void>;
}>();

const isLoadingValue = computed(() => unref(isLoading));

const statusResponseRef = useTemplateRef("statusResponseRef");

const responseRef = useTemplateRef("responseRef");

const title = computed(() =>
  action === "change-status"
    ? `Change Complaint Status - Request #${complaint.id}`
    : `Add Response to Complaint Request # ${complaint.id}`,
);

const statusOptions = ref<ComplaintStatusForm["status"][]>([
  "pending",
  "in-progress",
  "resolved",
  "rejected",
]);

const complaintStore = useComplaintStore();

const {
  complaintStatusResponseState,
  isAddResponseFormValid,
  isUpdateFormValid,
} = storeToRefs(complaintStore);
</script>

<template>
  <UModal
    :title
    description="Provide the necessary information below to proceed."
    :dismissible="false"
    :ui="{
      footer: 'justify-end',
      content: 'w-[90%] max-w-2xl h-auto rounded-lg shadow-lg ring ring-default overflow-hidden',
      title: 'font-newsreader text-xl font-semibold',
      description: 'text-base text-muted',
      close: 'cursor-pointer',
    }"
  >
    <template #body>
      <UForm
        v-if="action === 'change-status'"
        ref="statusResponseRef"
        :state="complaintStatusResponseState"
        :schema="complaintStatusResponseSchema.omit({ complaintId: true })"
        @submit.prevent="update"
      >
        <div class="flex flex-col gap-4">
          <UFormField
            required
            label="Status"
            name="status"
            class="w-full"
          >
            <USelectMenu
              v-model="complaintStatusResponseState.status"
              :items="statusOptions"
              size="xl"
              label="Select New Status"
              placeholder="Choose status"
              class="w-full"
              clear
            />
          </UFormField>

          <UFormField
            label="Response Message"
            name="responseText"
            class="w-full"
            required
          >
            <UTextarea
              v-model="complaintStatusResponseState.responseText"
              label="Response Message"
              placeholder="Type your response here..."
              class="w-full"
              autoresize
              :rows="6"
              :maxrows="10"
            />
          </UFormField>
        </div>
      </UForm>

      <UForm
        v-else
        ref="responseRef"
        :state="complaintStatusResponseState"
        :schema="maintenanceStatusResponseSchema.omit({ status: true, maintenanceId: true })"
        @submit.prevent="addResponse"
      >
        <UFormField
          required
          label="Response Message"
          name="responseText"
          class="w-full"
        >
          <UTextarea
            v-model.trim="complaintStatusResponseState.responseText"
            label="Response Message"
            placeholder="Type your response here..."
            class="w-full"
            autoresize
            :rows="6"
            :maxrows="10"
          />
        </UFormField>
      </UForm>
    </template>

    <template #footer="{ close }">
      <div class="flex gap-4">
        <UButton
          color="error"
          variant="outline"
          class="cursor-pointer"
          label="Cancel"
          @click="close"
        />

        <UButton
          color="primary"
          variant="solid"
          class="cursor-pointer"
          icon="i-lucide-send"
          :label="isLoading ? 'Submitting' : 'Submit Changes'"
          :loading="isLoadingValue"
          :disabled="action === 'change-status'
            ? !isUpdateFormValid
            : !isAddResponseFormValid"
          @click="action === 'change-status'
            ? statusResponseRef?.submit()
            : responseRef?.submit()"
        />
      </div>
    </template>
  </UModal>
</template>

<style scoped></style>

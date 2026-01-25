<script lang="ts" setup>
import type { FormErrorEvent } from "@nuxt/ui";

const { clearState } = defineProps<{
  isLoading: boolean | Ref<boolean>;
  submitFollowUp: () => Promise<void>;
  clearState: () => void;
  handleFormError: (event: FormErrorEvent) => void;
}>();

const followUpState = defineModel<Partial<ComplaintFollowUp>>("followUpState", { required: true });

const formRef = useTemplateRef("formRef");

onUnmounted(() => {
  clearState();
});
</script>

<template>
  <UModal
    title="Follow Up on Complaint"
    description="Provide the necessary information below to proceed."
    :dismissible="false"
    :ui="{
      footer: 'justify-end',
      content: 'w-[90%] max-w-2xl h-auto rounded-lg shadow-lg ring ring-default overflow-hidden',
      title: 'font-newsreader text-xl font-semibold',
      description: 'text-base text-muted',
      close: 'cursor-pointer',
      overlay: 'backdrop-blur-sm',
    }"
  >
    <template #body>
      <UForm
        ref="formRef"
        :state="followUpState"
        :schema="complaintStatusResponseSchema.omit({ status: true })"
        @submit.prevent="submitFollowUp"
        @error="handleFormError"
      >
        <UFormField
          required
          label="Follow Up Message"
          name="responseText"
          class="w-full"
        >
          <UTextarea
            v-model="followUpState.responseText"
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
      <div class="flex justify-end gap-4">
        <UButton
          label="Cancel"
          variant="outline"
          color="error"
          size="lg"
          class="cursor-pointer"
          @click="close"
        />

        <UButton
          variant="solid"
          color="primary"
          size="lg"
          icon="i-lucide-send"
          class="cursor-pointer"
          :label="isLoading ? 'Submitting...' : 'Submit Follow Up'"
          :loading="unref(isLoading)"
          @click="formRef?.submit()"
        />
      </div>
    </template>
  </UModal>
</template>

<style scoped>

</style>

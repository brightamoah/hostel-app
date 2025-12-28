<script lang="ts" setup>
import type { FormErrorEvent } from "@nuxt/ui";

const { editVisitorState, clearState } = defineProps<{
  isLoading: boolean | Ref<boolean>;
  editVisitorState: EditVisitor["data"];
  handleFormError: (event: FormErrorEvent) => void;
  editVisitor: () => Promise<void>;
  clearState: () => void;
}>();

const editForm = useTemplateRef("editForm");

const editState = ref<EditVisitor["data"]>({ ...editVisitorState });

onUnmounted(() => {
  clearState();
});
</script>

<template>
  <UModal
    title="Edit Visitor"
    description="Update visitor details below."
    :dismissible="false"
    :ui="{
      footer: 'justify-end',
      content: 'w-[90%] max-w-4xl  rounded-lg shadow-lg ring ring-default overflow-hidden',
      title: 'font-newsreader text-xl font-semibold',
      close: 'cursor-pointer',
    }"
  >
    <template #body>
      <VisitorForm
        ref="editForm"
        :state="editVisitorState as EditVisitor['data']"
        :schema="editVisitorSchema.shape.data"
        @update:state="editState = $event"
        @submit="editVisitor"
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
          @click="editForm?.visitorForm?.submit()"
        />
      </div>
    </template>
  </UModal>
</template>

<style scoped></style>

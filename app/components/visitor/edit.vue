<script lang="ts" setup>
import type { FormErrorEvent } from "@nuxt/ui";

import { parseDate } from "@internationalized/date";

const { visitor, isLoading } = defineProps<{
  visitor: VisitorType;
  isLoading: boolean | Ref<boolean>;
}>();

const toast = useToast();
const editForm = useTemplateRef("editForm");
const editingId = ref<number | null>(null);
const originalEditState = ref<EditVisitor["data"] | null>(null);

const editVisitorState = ref<EditVisitor["data"]>({
  name: "",
  visitDate: undefined,
  email: "",
  phoneNumber: "",
  relationship: "",
  purpose: "",
});

const isEditFormValid = computed(() => {
  const { email, name, phoneNumber, purpose, visitDate, relationship } = editVisitorState.value;

  return (
    (email?.trim() ?? "") !== ""
    && (name?.trim() ?? "") !== ""
    && (phoneNumber?.trim() ?? "") !== ""
    && (purpose?.trim() ?? "") !== ""
    && (relationship?.trim() ?? "") !== ""
    && visitDate !== undefined
  );
});

const hasNoChanges = computed(() => {
  if (!originalEditState.value) return false;

  return isDeepEqual(editVisitorState.value, originalEditState.value);
});

function initEditSession(visitor: VisitorType) {
  editingId.value = visitor.id;

  let visitDate;
  try {
    visitDate = parseDate(visitor.visitDate);
  }
  catch {
    console.error("Invalid visitDate format:", visitor.visitDate);
    visitDate = undefined;
  }

  const mappedState: EditVisitor["data"] = {
    name: visitor.name,
    visitDate,
    email: visitor.email,
    phoneNumber: visitor.phoneNumber,
    relationship: visitor.relationship,
    purpose: visitor.purpose,
  };

  editVisitorState.value = { ...mappedState };
  originalEditState.value = { ...mappedState };
}

async function submitEditForm() {
  if (!isEditFormValid.value || !editingId.value) return;

  if (hasNoChanges.value) {
    toast.add({
      title: "No Changes Detected",
      description: "Please make changes to the form before submitting.",
      color: "warning",
      icon: "i-lucide-triangle-alert",
    });
    return;
  }

  const changes: Partial<EditVisitor["data"]> = {};
  const current = editVisitorState.value;
  const original = originalEditState.value!;

  for (const key in current) {
    const k = key as keyof EditVisitor["data"];
    if (!isDeepEqual(current[k], original[k])) {
      // @ts-expect-error - Typescript gets strict about partial assignments, but this is safe
      changes[k] = current[k];
    }
  }
}

function handleFormError(event: FormErrorEvent) {
  const messages = event.errors.map(e => e.message).join(", ");
  toast.add({
    title: "Form Validation Error",
    description: messages,
    color: "error",
    icon: "i-lucide-circle-alert",
  });
}

onMounted(() => {
  initEditSession(visitor);
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
        v-model:state="editVisitorState as EditVisitor['data']"
        :schema="editVisitorSchema.shape.data"
        @submit="submitEditForm"
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

<script setup lang="ts">
const { title, description, confirmLabel, cancelLabel, confirmColor } = defineProps<{
  title?: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmColor?: "primary" | "error" | "warning" | "info" | "success" | "neutral";
}>();

const emit = defineEmits<{
  (e: "confirm"): void;
}>();

const open = defineModel<boolean>("open");

const confirmLabelProp = computed(() => confirmLabel ?? "Confirm");
const cancelLabelProp = computed(() => cancelLabel ?? "Cancel");
const confirmColorProp = computed(() => confirmColor ?? "error");

function onConfirm(close: () => void) {
  emit("confirm");

  if (typeof close === "function")
    close();
  open.value = false;
}

function show() {
  open.value = true;
}
function hide() {
  open.value = false;
}
function toggle() {
  open.value = !open.value;
}
</script>

<template>
  <UModal
    v-model:open="open"
    :title="title ?? 'Confirm action'"
    :description="description ?? 'Are you sure you want to proceed with this action?'"
    :ui="{
      footer: 'justify-end',
      body: 'text-lg',
    }"
  >
    <slot
      name="trigger"
      :show
      :hide
      :toggle
    >
      <UButton
        label="Open"
        color="neutral"
        variant="subtle"
      />
    </slot>

    <template #body>
      <slot>
        <!-- default message if no slot provided -->
        <p class="text-muted text-sm">
          Are you sure you want to proceed with this action?
        </p>
      </slot>
    </template>

    <template #footer="{ close }">
      <UButton
        :label="cancelLabelProp"
        color="neutral"
        variant="outline"
        class="cursor-pointer"
        @click="close"
      />

      <UButton
        :label="confirmLabelProp"
        :color="confirmColorProp"
        class="ml-2 cursor-pointer"
        @click="onConfirm(close)"
      />
    </template>
  </UModal>
</template>

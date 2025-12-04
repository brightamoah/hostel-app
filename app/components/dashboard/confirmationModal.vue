<script setup lang="ts">
const { title, description, confirmLabel, cancelLabel, confirmColor, isLoading, renderTrigger } = defineProps<{
  title?: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmColor?: "primary" | "error" | "warning" | "info" | "success" | "neutral";
  isLoading?: boolean | Ref<boolean>;
  renderTrigger?: boolean;
  body?: string;
}>();

const emit = defineEmits<{
  (e: "confirm"): void;
}>();

const open = defineModel<boolean>("open");

const isLoadingValue = computed(() => unref(isLoading));

const confirmLabelProp = computed(() => confirmLabel ?? "Confirm");
const cancelLabelProp = computed(() => cancelLabel ?? "Cancel");
const confirmColorProp = computed(() => confirmColor ?? "error");
const renderTriggerProp = computed(() => (typeof renderTrigger === "boolean" ? renderTrigger : true));

const instance = getCurrentInstance();
const hasIsLoading = computed(() => {
  const vnodeProps = instance?.vnode?.props ?? {};
  const propKeys = Object.keys(vnodeProps).map(k => k.toLowerCase());
  const propSet = new Set(propKeys);
  return propSet.has("isloading") || propSet.has("is-loading");
});

const confirmButtonLabel = computed(() =>
  hasIsLoading.value && isLoadingValue.value ? (confirmLabel ?? "") : confirmLabelProp.value,
);

function onConfirm(close?: () => void) {
  emit("confirm");

  if (hasIsLoading.value) return;

  if (typeof close === "function") close();
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

defineExpose({
  show,
  hide,
  toggle,
  open,
});
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
    <template v-if="renderTriggerProp">
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
    </template>

    <template #body>
      <slot>
        <!-- default message if no slot provided -->
        <p class="text-base">
          {{ body ?? "Are you sure you want to proceed with this action?" }}
        </p>
      </slot>
    </template>

    <template #footer="{ close }">
      <UButton
        :label="cancelLabelProp"
        color="neutral"
        variant="outline"
        class="cursor-pointer"
        :disabled="hasIsLoading && isLoadingValue"
        @click="open = false"
      />

      <UButton
        :label="confirmButtonLabel"
        :color="confirmColorProp"
        :loading="isLoadingValue"
        :disabled="hasIsLoading && isLoadingValue"
        class="ml-2 cursor-pointer"
        @click="onConfirm(close)"
      />
    </template>
  </UModal>
</template>

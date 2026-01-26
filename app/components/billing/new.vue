<script lang="ts" setup>
const billingStore = useBillingStore();

const {
  createBillingState,
  isLoading,
} = storeToRefs(billingStore);

const billingForm = useTemplateRef("billingForm");
const isModalOpen = ref(false);

watch(isModalOpen, (open) => {
  if (!open) billingStore.clearBillingState();
});
</script>

<template>
  <UModal
    v-model:open="isModalOpen"
    title="Create New Invoice"
    description="Fill out the form to create a new billing invoice"
    :dismissible="false"
    :ui="{
      footer: 'justify-end',
      content: 'max-w-3xl  rounded-lg shadow-lg ring ring-default overflow-hidden',
      title: 'font-newsreader text-xl font-semibold',
      close: 'cursor-pointer',
      overlay: 'backdrop-blur-sm',
    }"
  >
    <UButton
      label="Create Invoice"
      icon="lucide-ticket-plus"
      variant="solid"
      color="primary"
      size="lg"
      class="justify-center items-center cursor-pointer"
    />

    <template #body>
      <BillingForm
        ref="billingForm"
        :schema="createBillingSchema"
        :billing-state="createBillingState as CreateBillingSchema"
        @error="useHandleFormError"
        @submit="billingStore.createBilling"
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
          color="primary"
          icon="i-lucide-send"
          class="cursor-pointer"
          :label=" isLoading ? 'Submitting...' : 'Submit Visitor'"
          :loading="isLoading"
          @click="billingForm?.form?.submit()"
        />
      </div>
    </template>
  </UModal>
</template>

<style>

</style>

<script lang="ts" setup>
const isOpen = ref(false);

const state = ref<Partial<VerifyPaymentSchema>>({
  reference: "",
});
const toast = useToast();
const router = useRouter();

const form = useTemplateRef("form");

const isLoading = ref(false);

const billingIdComputed = computed(() => {
  const parts = state.value.reference?.split("-");
  const billingIdStr = parts?.[1];
  const Id = Number.parseInt(billingIdStr!, 10);
  const returnableId = Number.isNaN(Id) ? undefined : Id;

  return returnableId;
});

watch(billingIdComputed, (newBillingId) => {
  state.value.billingId = newBillingId;
});

async function proceedToVerification() {
  isLoading.value = true;
  const { reference, billingId } = state.value;

  if (!reference || !billingId) {
    toast.add({
      title: "Validation Error",
      description: "Payment reference is required",
      color: "error",
    });

    return;
  }

  isOpen.value = false;

  router.push({
    name: "billing-verify",
    query: {
      reference,
      billingId,
    },
  });

  isLoading.value = false;
}
</script>

<template>
  <div>
    <UModal
      v-model:open="isOpen"
      title="Verify Payment"
      description="Verify payments by providing their reference reference"
      :dismissible="false"
      :ui="{
        footer: 'justify-end',
        content: 'w-[90%] max-w-xl h-auto rounded-lg shadow-lg ring ring-default overflow-hidden',
        title: 'font-newsreader text-xl font-semibold',
        description: 'text-base text-muted capitalize',
        close: 'cursor-pointer',
        overlay: 'backdrop-blur-sm',
      }"
    >
      <UButton
        icon="lucide:badge-check"
        label="Verify Payment"
        variant="subtle"
        color="success"
        class="border-2 border-dashed cursor-pointer"
      />

      <template #body>
        <UForm
          ref="form"
          :state
          :schema="verifyPaymentSchema"
          @submit="proceedToVerification"
          @error="useHandleFormError"
        >
          <UFormField
            required
            label="Transaction Reference"
            name="reference"
            class="w-full"
          >
            <UInput
              v-model="state.reference"
              placeholder="Enter transaction reference"
              class="w-full cursor-pointer"
              size="xl"
            />
          </UFormField>
        </UForm>
      </template>

      <template #footer>
        <div class="flex gap-2.5">
          <UButton
            label="Cancel"
            variant="outline"
            color="error"
            class="cursor-pointer"
            @click="isOpen = false"
          />

          <UButton
            label="Verify Payment"
            variant="solid"
            color="primary"
            class="cursor-pointer"
            :loading="isLoading"
            icon="i-lucide-badge-check"
            @click="form?.submit()"
          />
        </div>
      </template>
    </UModal>
  </div>
</template>

<style scoped>

</style>

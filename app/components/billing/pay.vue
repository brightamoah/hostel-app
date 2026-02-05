<script lang="ts" setup>
import type { FormErrorEvent, RadioGroupItem } from "@nuxt/ui";

import { capitalize } from "vue";

const { billing } = defineProps<{
  billing: Billing;
}>();

const emit = defineEmits<{ close: [boolean] }>();

const billingStore = useBillingStore();
const {
  paymentState,
  isPaymentModalOpen,
  isLoading,
} = storeToRefs(billingStore);
const { clearPaymentState, initiatePayment } = billingStore;

const subtotal = computed(() => Number(billing.amount));
const lateFee = computed(() => Number(billing.lateFee || 0));
const total = computed(() => subtotal.value + lateFee.value);
const balanceDue = computed(() => total.value - Number(billing.paidAmount));
const purpose = computed(() => billing.type);

const helpText = computed(() => {
  return `Minimum: GH₵1.00 | Maximum: ${formatCurrency(balanceDue.value)}`;
});

const cardDetails = ref([
  {
    label: "Invoice Number",
    value: billing.invoiceNumber,
  },
  {
    label: "Description",
    value: billing.description,
  },
  {
    label: "Purpose",
    value: capitalize(purpose.value),
  },
  {
    label: "Outstanding Amount",
    value: formatCurrency(balanceDue.value),
    isAmount: true,
  },
]);

const paymentType = ref<RadioGroupItem[]>([
  {
    label: `Full Payment: ${formatCurrency(balanceDue.value)}`,
    value: "full",
    description: "Pay the entire outstanding amount.",
  },
  {
    label: "Partial Payment",
    value: "partial",
    description: "Pay a portion of the outstanding amount.",
  },
]);
const selectedPaymentType = ref<"partial" | "full">("full");

watch(selectedPaymentType, (newType) => {
  if (newType === "full") paymentState.value.amount = balanceDue.value;
  else paymentState.value.amount = undefined;
});

onMounted(() => {
  paymentState.value.totalAmount = total.value;
  paymentState.value.amount = balanceDue.value;
  paymentState.value.email = billing.student.user.email;
  paymentState.value.phoneNumber = billing.student.phoneNumber;
  paymentState.value.billingId = billing.id;
});

const paymentForm = useTemplateRef("paymentForm");

function handleFormError(event: FormErrorEvent) {
  useHandleFormError(event);
}

function submitPayment() {
  const { amount, billingId, email, phoneNumber, totalAmount } = paymentState.value;

  if (!amount) throw new Error("Payment amount is missing.");
  if (!billingId) throw new Error("Billing ID is missing.");
  if (!totalAmount) throw new Error("Total amount is missing.");
  if (!email) throw new Error("Email is missing.");
  if (!phoneNumber) throw new Error("Phone number is missing.");

  initiatePayment({
    amount,
    email,
    phoneNumber,
    totalAmount,
    billingId,
  });
}

function closeModal() {
  isPaymentModalOpen.value = false;
  emit("close", false);
  clearPaymentState();
}
</script>

<template>
  <UModal
    v-model:open="isPaymentModalOpen"
    title="Payment Details"
    description="Details for making a payment"
    :dismissible="false"
    :ui="{
      footer: 'justify-end',
      content: 'w-[80%] max-w-xl h-auto rounded-lg shadow-lg ring ring-default overflow-hidden',
      title: 'font-newsreader text-xl font-semibold',
      description: 'text-base text-muted hidden',
      close: 'cursor-pointer',
      overlay: 'backdrop-blur-sm',
    }"
  >
    <template #body>
      <UForm
        ref="paymentForm"
        v-auto-animate
        :schema="paymentSchema"
        :state="paymentState"
        @error="handleFormError"
        @submit="submitPayment"
      >
        <UCard>
          <div class="space-y-2">
            <p
              v-for="item in cardDetails"
              :key="item.label"
              class="text-sm"
            >
              <strong>{{ item.label }}: </strong>

              <span :class="item.isAmount ? 'font-semibold text-error' : ''">
                {{ item.value }}</span>
            </p>
          </div>
        </UCard>

        <URadioGroup
          v-model="selectedPaymentType"
          :items="paymentType"
          value-key="value"
          variant="card"
          class="mt-4"
          :ui="{
            fieldset: 'gap-2',
            item: 'cursor-pointer',
          }"
        />

        <UFormField
          v-if="selectedPaymentType === 'partial'"
          label="Enter Amount GH₵"
          class="mt-4 w-full"
          name="amount"
          :help="helpText"
        >
          <UInput
            v-model.number="paymentState.amount"
            type="number"
            placeholder="0.00"
            size="lg"
            :min="1"
            :max="balanceDue"
            class="w-full"
            autofocus
            :ui="{
              leading: 'pr-2 mr-5',
            }"
          >
            <template #leading>
              GH₵
            </template>
          </UInput>
        </UFormField>
      </UForm>
    </template>

    <template #footer>
      <div class="flex gap-2.5">
        <UButton
          label="Cancel"
          color="neutral"
          variant="outline"
          class="cursor-pointer"
          @click="closeModal"
        />

        <UButton
          label="Proceed To Pay"
          color="primary"
          variant="solid"
          class="cursor-pointer"
          icon="i-lucide-credit-card"
          :loading="isLoading"
          @click="paymentForm?.submit()"
        />
      </div>
    </template>
  </UModal>
</template>

<style>

</style>

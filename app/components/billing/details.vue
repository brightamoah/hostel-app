<script lang="ts" setup>
const { billing } = defineProps<{
  billing: Billing;
}>();

const emit = defineEmits<{
  download: [billing: Billing];
  email: [billing: Billing];
}>();

const detailCards = [
  [
    {
      label: "Billed To",
      value: billing.student.user.name,
      icon: "i-lucide-user",
    },
    {
      label: "",
      value: billing.student.user.email,
      icon: "i-lucide-mail",
    },
    {
      label: "",
      value: billing.student.phoneNumber,
      icon: "i-lucide-phone",
    },
    {
      label: "",
      value: billing.student.address,
      icon: "i-lucide-map-pin",
    },
  ],
  [
    {
      label: "From",
      value: billing.hostel.name,
      icon: "i-lucide-building",
    },
    {
      label: "",
      value: billing.hostel.address,
      icon: "i-lucide-map-pin",
    },
    {
      label: "",
      value: billing.hostel.contactNumber,
      icon: "i-lucide-phone",
    },
    {
      label: "",
      value: billing.hostel.email,
      icon: "i-lucide-mail",
    },
  ],
];

const subtotal = computed(() => Number(billing.amount));
const lateFee = computed(() => Number(billing.lateFee || 0));
const total = computed(() => subtotal.value + lateFee.value);
const balanceDue = computed(() => total.value - Number(billing.paidAmount));
</script>

<template>
  <UModal
    title="Invoice Details"
    description="Detailed billing information."
    :dismissible="false"
    :ui="{
      footer: 'justify-end',
      content: 'w-[80%] max-w-4xl h-auto rounded-lg shadow-lg ring ring-default overflow-hidden',
      title: 'font-newsreader text-xl font-semibold',
      description: 'text-base text-muted',
      close: 'cursor-pointer',
      overlay: 'backdrop-blur-sm',
    }"
  >
    <template #body>
      <BillingHeader
        :invoice-number="billing.invoiceNumber"
        :date-issued="new Date(billing.dateIssued)"
        :due-date="billing.dueDate"
        :hostel-address="billing.hostel.address"
      />

      <USeparator
        class="my-4"
        type="dashed"
        size="sm"
      />

      <div class="gap-4 grid grid-cols-1 md:grid-cols-2">
        <UCard
          v-for="(card, index) in detailCards"
          :key="index"
          class="p-0 sm:p-0"
        >
          <p
            v-for="detail in card"
            :key="detail.label + detail.value"
            class="flex items-center gap-2 mb-3 last:-mb-2 text-sm"
          >
            <UIcon
              :name="detail.icon"
              class="size-5 text-primary"
            />

            {{ detail.label }}: <span class="font-medium">{{ detail.value }}</span>
          </p>
        </UCard>
      </div>

      <BillingTable
        :description="billing.description"
        :amount="Number(billing.amount)"
        :subtotal
        :late-fee
        :total
        :balance-due
        :paid-amount="Number(billing.paidAmount)"
        class="mt-4"
      />

      <BillingPayment
        :payments="billing.payments"
        class="mt-6"
      />
    </template>

    <template #footer="{ close }">
      <div class="flex justify-end gap-3">
        <UButton
          label="Close"
          color="error"
          variant="outline"
          class="cursor-pointer"
          icon="i-lucide-x"
          @click="close()"
        />

        <UButton
          label="Download"
          color="neutral"
          variant="outline"
          class="cursor-pointer"
          icon="i-lucide-download"
          @click="emit('download', billing)"
        />

        <UButton
          label="Email Invoice"
          color="primary"
          variant="solid"
          class="cursor-pointer"
          icon="i-lucide-send"
          @click="emit('email', billing)"
        />
      </div>
    </template>
  </UModal>
</template>

<style></style>

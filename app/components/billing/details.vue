<script lang="ts" setup>
const { billing } = defineProps<{
  billing: Billing;
}>();

const { $apiFetch } = useNuxtApp();
const billingStore = useBillingStore();
const { isSending } = storeToRefs(billingStore);
const { emailInvoice } = billingStore;

const isMobile = inject("isMobile") as ComputedRef<boolean>;
const toast = useToast();
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

const invoiceContent = useTemplateRef("invoiceContent");
const isGenerating = ref(false);

const subtotal = computed(() => Number(billing.amount));
const lateFee = computed(() => Number(billing.lateFee || 0));
const total = computed(() => subtotal.value + lateFee.value);
const balanceDue = computed(() => total.value - Number(billing.paidAmount));

async function handleDownload() {
  if (isGenerating.value) return;

  isGenerating.value = true;
  try {
    const response = await $apiFetch(`/api/billing/download/${billing.id}`, {
      responseType: "blob",
    });

    const url = window.URL.createObjectURL(response as unknown as Blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `invoice-${billing.invoiceNumber}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    toast.add({
      title: "Success",
      description: "Invoice downloaded successfully",
      color: "success",
      icon: "i-lucide-check-circle",
    });
  }
  catch (error) {
    console.error("Download error:", error);
    const errorMessage = error instanceof Error && "data" in error
      ? (error.data as any)?.message
      : "Failed to download invoice. Please try again.";
    toast.add({
      title: "Download Failed",
      description: errorMessage || "Failed to download invoice. Please try again.",
      color: "error",
      icon: "i-lucide-x-circle",
    });
  }
  finally {
    isGenerating.value = false;
  }
}
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
      <div ref="invoiceContent">
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

        <div class="mt-4 rounded-lg p-4 border border-muted">
          <h6 class="font-bold flex items-center gap-2 mb-2 text-sm">
            <UIcon
              name="i-lucide-file-text"
              class="text-primary size-4"
            /> Terms & Conditions
          </h6>

          <ul class="text-xs text-muted space-y-1 pl-6 list-decimal">
            <li>Payment is due within 30 days of invoice date.</li>

            <li>Late payments will incur a 5% penalty fee.</li>

            <li>No refunds will be issued after the academic term begins.</li>
          </ul>
        </div>
      </div>
    </template>

    <template #footer="{ close }">
      <div class="flex gap-2.5">
        <UButton
          v-if="!isMobile"
          label="Close"
          color="error"
          variant="outline"
          class="cursor-pointer"
          icon="i-lucide-x"
          @click="close()"
        />

        <UButton
          :label="isGenerating ? 'Downloading...' : 'Download'"
          color="neutral"
          variant="outline"
          class="cursor-pointer"
          :size="isMobile ? 'sm' : 'md'"
          icon="i-lucide-download"
          :loading="isGenerating"
          @click="handleDownload"
        />

        <UButton
          label="Email Invoice"
          color="primary"
          variant="solid"
          class="cursor-pointer"
          :size="isMobile ? 'sm' : 'md'"
          icon="i-lucide-send"
          :loading="isSending"
          @click="emailInvoice(billing.id, billing.student.user.email)"
        />
      </div>
    </template>
  </UModal>
</template>

<style></style>

<script setup lang="ts">
import { useDateFormat } from "@vueuse/core";

definePageMeta({
  layout: "verify-billing",
  middleware: ["requires-auth"],
});

const route = useRoute();
const router = useRouter();
const toast = useToast();
const { $apiFetch } = useNuxtApp();
const { user } = useUserSession();

const isVerifying = ref(true);
const verificationStatus = ref<"success" | "error" | "processing">("processing");
const message = ref("");

const billingKey = computed(() => user.value?.role === "admin"
  ? `billingData:${user.value?.adminData?.accessLevel}`
  : `billingData:${user.value?.id}`);

interface PaymentDetails {
  amount: number;
  status: Billing["status"];
  transactionId: number;
  paidAt: string;
  remainingBalance: number;
  paymentMethod: string;
  reference: string;
}

const paymentDetails = ref<PaymentDetails | null>(null);

const paymentDetailsOutput = computed(() => {
  if (!paymentDetails.value) return [];

  return [
    {
      label: "Amount Paid" as const,
      value: formatCurrency(paymentDetails.value.amount),
      icon: "i-heroicons-banknotes",
      border: true,
    },
    {
      label: "Status" as const,
      value: paymentDetails.value.status,
      icon: "i-lucide-info",
      border: true,
    },
    {
      label: "Remaining Balance" as const,
      value: formatCurrency(paymentDetails.value.remainingBalance),
      icon: "i-heroicons-currency-dollar",
      border: true,
    },
    {
      label: "Transaction ID" as const,
      value: `#${paymentDetails.value?.transactionId}`,
      icon: "i-lucide-hash",
      border: true,
    },
    {
      label: "Transaction Reference" as const,
      value: paymentDetails.value?.reference,
      icon: "i-lucide-hash",
      border: true,
    },
    {
      label: "Paid At" as const,
      value: useDateFormat(new Date(paymentDetails.value.paidAt), "DD MMM YYYY, h:mm A").value,
      icon: "i-lucide-calendar-check",
      border: false,
    },
    {
      label: "Payment Method",
      value: paymentDetails.value.paymentMethod,
      icon: "i-lucide-credit-card",
      border: true,
    },
  ];
});

onMounted(async () => {
  const queryRef = route.query.reference || route.query.trxref;
  const reference = Array.isArray(queryRef) ? queryRef[0] : queryRef as string;

  if (!reference) {
    verificationStatus.value = "error";
    message.value = "Invalid payment reference link";
    isVerifying.value = false;

    toast.add({
      title: "Verification Error",
      description: "Payment reference is missing",
      color: "error",
      icon: "i-lucide-circle-x",
      duration: 5000,
    });
    return;
  }

  try {
    const parts = reference.split("-");
    const billingIdStr = parts[1]!;
    const billingId = Number.parseInt(billingIdStr, 10);

    if (Number.isNaN(billingId)) throw new Error("Invalid Invoice ID in reference");

    const response = await $apiFetch("/api/billing/verifyPayment", {
      method: "POST",
      body: {
        reference,
        billingId,
      },
    }).then(res => res as {
      message: string;
      success: boolean;
      data: {
        amount: number;
        status: Billing["status"];
        transactionId: number;
        paidAt: string;
        remainingBalance: number;
        paymentMethod: string;
        reference: string;
      };
    });

    if (!response.success && !response.data) {
      throw new Error(response.message);
    }

    verificationStatus.value = "success";
    message.value = response.message;
    paymentDetails.value = response.data || null;

    await refreshNuxtData(billingKey.value);

    toast.add({
      title: "Payment Successful",
      description: message.value,
      color: "success",
      icon: "i-lucide-check-circle",
      duration: 5000,
    });
  }
  catch (error: any) {
    verificationStatus.value = "error";
    message.value = error?.data?.message || "Payment verification failed. Please contact support.";

    toast.add({
      title: "Verification Failed",
      description: message.value,
      color: "error",
      icon: "i-lucide-circle-alert",
      duration: 8000,
    });
  }
  finally {
    isVerifying.value = false;
  }
});

function goToBilling() {
  router.push("/student/billing");
}
</script>

<template>
  <UCard
    v-auto-animate
    class="shadow-sm ring-1 ring-muted w-full max-w-lg"
  >
    <div
      v-if="verificationStatus === 'success'"
      class="flex flex-col py-4 h-full"
    >
      <UIcon
        name="i-lucide-circle-check-big"
        size="48"
        class="mx-auto mb-4 text-success"
      />

      <div class="text-center">
        <h3 class="mb-2 font-semibold text-highlighted text-xl">
          Payment Successful!
        </h3>

        <p class="mb-4 text-default">
          {{ message }}
        </p>
      </div>

      <UCard
        class="ring-1 ring-muted w-full min-w-md h-full"
        :ui="{ header: 'bg-primary/10 py-3' }"
      >
        <div class="space-y-3 text-sm">
          <div
            v-for="(item, index) in paymentDetailsOutput"
            :key="index"
            class="flex justify-between pb-2"
            :class="{ 'border-b border-muted': item.border }"
          >
            <span class="flex items-center gap-2 text-muted">
              <UIcon
                :name="item.icon"
                class="size-4 text-primary"
              />
              {{ item.label }}:
            </span>

            <UBadge
              v-if="item.label === 'Status'"
              :label="item.value"
              :color="billingStatusColorMap[item.value.toLowerCase() as Billing['status']]"
              variant="subtle"
              size="md"
              class="capitalize"
            />

            <span
              v-else
              class="font-medium"
              :class="item.label === 'Remaining Balance' ? 'text-error' : ''"
            >{{ item.value }}</span>
          </div>
        </div>
      </UCard>
    </div>

    <div class="flex flex-col items-center gap-4 py-4">
      <div
        v-if="isVerifying && verificationStatus === 'processing'"
        class="flex flex-col justify-center items-center py-4 h-full"
      >
        <UIcon
          name="i-lucide-loader"
          size="48"
          class="mx-auto mb-4 text-primary animate-spin"
        />

        <h2 class="mb-2 font-semibold text-2xl">
          Confirming Payment...
        </h2>

        <p class="text-muted">
          Please wait while we confirm your transaction.
        </p>
      </div>

      <div
        v-if="verificationStatus === 'error'"
        class="flex flex-col items-center gap-4"
      >
        <UIcon
          name="i-lucide-circle-x"
          size="48"
          class="mx-auto text-error"
        />

        <div class="text-center">
          <h3 class="mb-2 font-semibold text-error text-xl">
            Verification Failed
          </h3>

          <p class="text-default">
            {{ message }}
          </p>
        </div>
      </div>

      <UButton
        v-if="!isVerifying"
        label="Return to Billings"
        color="primary"
        size="lg"
        class="cursor-pointer"
        @click="goToBilling"
      />
    </div>
  </UCard>
</template>

<style scoped>

</style>

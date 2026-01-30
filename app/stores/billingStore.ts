import { getLocalTimeZone, today } from "@internationalized/date";
import { acceptHMRUpdate, defineStore } from "pinia";

const baseBilling: Partial<CreateBillingSchema> = {
  studentId: undefined,
  amount: undefined,
  type: undefined,
  academicPeriod: undefined,
  description: "",
  dueDate: undefined,
  paymentTerms: undefined,
  sendNotification: false,
};

export const useBillingStore = defineStore("billingStore", () => {
  const toast = useToast();
  const { $apiFetch } = useNuxtApp();

  const { user } = useUserSession();

  const isModalOpen = ref(false);

  const billingKey = computed(() => user.value?.role === "admin"
    ? `billingData:${user.value?.adminData?.accessLevel}`
    : `billingData:${user.value?.id}`);

  const createBillingState = ref<Partial<CreateBillingSchema>>(baseBilling);
  const isLoading = ref(false);

  watch(() => createBillingState.value.paymentTerms, (terms) => {
    if (!terms) return;

    const timezone = getLocalTimeZone();
    let date = today(timezone);

    switch (terms) {
      case "Net 15 Days":
        date = date.add({ days: 15 });
        break;
      case "Net 30 Days":
        date = date.add({ days: 30 });
        break;
      case "Net 45 Days":
        date = date.add({ days: 45 });
        break;
      case "Immediate Payment":
        date = date.add({ days: 1 });
        break;
    }
    createBillingState.value.dueDate = date;
  });

  const createBilling = async () => {
    isLoading.value = true;

    try {
      const response = await $apiFetch("/api/billing/create", {
        method: "POST",
        body: createBillingState.value,
      });

      await refreshNuxtData(billingKey.value);

      toast.add({
        title: response.message,
        description: `Billing record for student created successfully.`,
        color: "success",
        icon: "i-lucide-check-circle",
        duration: 5000,
      });

      isModalOpen.value = false;
      clearBillingState();
    }
    catch (error) {
      const message = (error as any)?.data?.message;
      toast.add({
        title: "Failed to Create Billing Record",
        description: message,
        color: "error",
        icon: "i-lucide-circle-alert",
        duration: 8000,
      });
    }
    finally {
      isLoading.value = false;
    }
  };

  function clearBillingState() {
    createBillingState.value = { ...baseBilling };
  }

  const isSending = ref(false);

  const emailInvoice = async (billing: Billing) => {
    if (!billing.id || !billing.student?.user?.email) return;

    isSending.value = true;

    try {
      const pdfBlob = await generateInvoicePDF(billing);

      const amount = Number(billing.amount);
      const lateFee = Number(billing.lateFee || 0);
      const amountPaid = Number(billing.paidAmount || 0);
      const amountTotal = Number(amount + lateFee);
      const amountDue = Number(amountTotal - amountPaid);
      const dateIssued = billing.dateIssued;
      const dateDue = billing.dueDate;

      const formData = new FormData();

      formData.append("file", pdfBlob, `Invoice-${billing.invoiceNumber}.pdf`);
      formData.append("studentEmail", billing.student.user.email);
      formData.append("studentName", billing.student.user.name);
      formData.append("invoiceNumber", billing.invoiceNumber);
      formData.append("studentUserId", String(billing.student.userId));
      formData.append("amountTotal", amountTotal.toString());
      formData.append("amountPaid", amountPaid.toString());
      formData.append("amountDue", amountDue.toString());
      formData.append("dateIssued", dateIssued ? new Date(dateIssued).toISOString() : "");
      formData.append("dateDue", dateDue ? new Date(dateDue).toISOString() : "");
      formData.append("amount", amount.toString());

      const response = await $apiFetch("/api/billing/emailInvoice", {
        method: "POST",
        body: formData,
      });

      toast.add({
        title: "Invoice Email Sent",
        description: response.message,
        color: "success",
        icon: "i-lucide-check-circle",
        duration: 5000,
      });
    }
    catch (error) {
      const message = (error as any)?.data?.message;
      toast.add({
        title: "Failed to Send Invoice Email",
        description: message,
        color: "error",
        icon: "i-lucide-circle-alert",
        duration: 8000,
      });
    }
    finally {
      isSending.value = false;
    }
  };

  return {
    createBillingState,
    isLoading,
    isModalOpen,
    isSending,
    createBilling,
    clearBillingState,
    emailInvoice,
  };
});

if (import.meta.hot) import.meta.hot.accept(acceptHMRUpdate(useBillingStore, import.meta.hot));

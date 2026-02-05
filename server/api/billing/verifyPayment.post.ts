import { billingQueries } from "~~/server/db/queries";

export default defineEventHandler(async (event) => {
  await requireUserSession(event);

  try {
    const body = await readValidatedBody(event, body => verifyPaymentSchema.safeParse(body));

    if (!body.success) {
      throw createError({
        statusCode: 400,
        message: `${body.error.issues
          .map(i => i.message)
          .join(", ")}`,
      });
    }

    const { billingId, reference } = body.data;

    const {
      checkExistingPayment,
      processSuccessfulPayment,
      markPaymentAsFailed,
      getBillingById,

    } = await billingQueries();

    const existingPayment = await checkExistingPayment(reference);

    if (!existingPayment) {
      throw createError({
        statusCode: 404,
        message: "Payment reference not found in system.",
      });
    }

    if (existingPayment.status === "completed") {
      throw createError({
        statusCode: 400,
        message: "This payment has already been verified and completed.",
      });
    }

    const verifyResponse = await verifyPaystackTransaction(reference);

    if (!verifyResponse.status || verifyResponse.data?.status !== "success") {
      await markPaymentAsFailed(reference);

      throw createError({
        statusCode: 400,
        message: `Payment failed: ${verifyResponse.data?.gateway_response || "Transaction was not successful"}`,
      });
    }

    const transaction = verifyResponse.data;

    const currentBilling = await getBillingById(billingId);

    if (!currentBilling) {
      throw createError({
        statusCode: 404,
        message: "Billing record not found.",
      });
    }

    const verifiedAmount = Number(transaction.amount) / 100;
    const prevPaid = Number(currentBilling.paidAmount || 0);
    const newPaidTotal = prevPaid + verifiedAmount;
    const totalDue = Number(currentBilling.amount) + Number(currentBilling.lateFee || 0);

    const paymentMethod = mapPaystackChannel(transaction.channel);

    let newStatus: "partially paid" | "fully paid" = "partially paid";
    if (newPaidTotal >= totalDue - 0.01) {
      newStatus = "fully paid";
    }

    await processSuccessfulPayment(
      billingId,
      reference,
      paymentMethod,
      verifiedAmount,
      newPaidTotal,
      newStatus,
    );

    return {
      success: true,
      message: `Payment of ${formatCurrency(verifiedAmount)} verified successfully. ${newStatus === "fully paid" ? "Invoice fully paid!" : `Balance remaining: ${formatCurrency(totalDue - newPaidTotal)}`}`,
      data: {
        amount: verifiedAmount,
        status: newStatus,
        transactionId: transaction.id,
        paidAt: transaction.paid_at,
        remainingBalance: Math.max(0, totalDue - newPaidTotal),
        paymentMethod,
        reference,
      },
    };
  }
  catch (error) {
    if (error && typeof error === "object" && "statusCode" in error) throw error;

    handleError(error, "Verify Payment", event);
  }
});

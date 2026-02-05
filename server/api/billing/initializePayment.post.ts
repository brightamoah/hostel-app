import { billingQueries } from "~~/server/db/queries";

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event, {
    message: "Unauthorized Access: Please log in to continue.",
  });

  const runtimeConfig = useRuntimeConfig(event);

  try {
    const body = await readValidatedBody(event, body => paymentSchema.safeParse(body));

    if (!body.success) {
      throw createError({
        statusCode: 400,
        message: `${body.error.issues
          .map(i => i.message)
          .join(", ")}`,
      });
    }

    const { billingId, amount, email, phoneNumber, totalAmount } = body.data;

    const { getBillingById, createPaymentIntent } = await billingQueries();
    const billing = await getBillingById(billingId);

    if (!billing) {
      throw createError({
        statusCode: 404,
        message: "Billing record not found.",
      });
    }

    if (user.role === "student" && billing.studentId !== user.studentId) {
      throw createError({
        statusCode: 403,
        message: "You are not authorized to make payment for this billing.",
      });
    }

    const balanceDue = totalAmount - Number(billing.paidAmount || 0);

    if (amount > balanceDue) {
      throw createError({
        statusCode: 400,
        message: `Payment amount (${formatCurrency(amount)}) exceeds balance due (${formatCurrency(balanceDue)})`,
      });
    }

    // reference format: KH-{billingId}-{timestamp}-{studentId}-{random}
    const reference = `KH-${billing.id}-${Date.now()}-${billing.studentId}-${Math.floor(Math.random() * 10000)}`;

    const baseUrl: string = import.meta.dev
      ? "http://localhost:3000"
      : runtimeConfig.public.siteUrl;

    const response = await initializePaystackTransaction({
      email,
      amount,
      currency: "GHS",
      reference,
      channels: ["card", "bank", "ussd", "qr", "mobile_money", "bank_transfer"],
      callbackUrl: `${baseUrl}/billing/verify?reference=${reference}`,
      metadata: {
        billingId: billing.id,
        studentId: billing.studentId,
        invoiceNumber: billing.invoiceNumber,
        description: billing.description,
        phoneNumber,
        billingType: billing.type,
        studentName: billing.student.user.name,
        amountGHS: totalAmount.toFixed(2),
        custom_fields: [
          {
            display_name: "Invoice Number",
            variable_name: "invoice_number",
            value: billing.invoiceNumber,
          },
          {
            display_name: "Student Name",
            variable_name: "student_name",
            value: billing.student.user.name,
          },
          {
            display_name: "Phone Number",
            variable_name: "phone_number",
            value: phoneNumber,
          },
          {
            display_name: "Billing Type",
            variable_name: "billing_type",
            value: billing.type,
          },
        ],
      },
    });

    if (!response.status) {
      throw createError({
        statusCode: 500,
        message: "Failed to initialize payment. Please try again later.",
      });
    }

    await createPaymentIntent(
      billingId,
      billing.studentId,
      amount,
      reference,
    );

    const data = response.data;

    return {
      success: true,
      message: "Payment initialized successfully.",
      data: {
        authorizationUrl: data?.authorization_url,
        accessCode: data?.access_code,
        reference: data?.reference,
      },
    };
  }
  catch (error) {
    if (error && typeof error === "object" && "statusCode" in error) throw error;

    handleError(error, "Initialize Payment", event);
  }
});

import { billingQueries } from "~~/server/db/queries/billing";

export default defineEventHandler(async (event) => {
  await adminSessionCheck(event);

  const billingId = Number(getRouterParam(event, "id"));

  if (!billingId || Number.isNaN(billingId)) {
    throw createError({
      statusCode: 400,
      message: "Invalid billing ID",
    });
  }

  try {
    const { getBillingById } = await billingQueries();
    const billing = await getBillingById(billingId);

    if (!billing) {
      throw createError({
        statusCode: 404,
        message: "Billing record not found",
      });
    }

    const pdfBuffer = await generateInvoicePDF(billing);

    setHeader(event, "Content-Type", "application/pdf");
    setHeader(event, "Content-Disposition", `attachment; filename="invoice-${billing.invoiceNumber}.pdf"`);
    setHeader(event, "Content-Length", pdfBuffer.length);

    return pdfBuffer;
  }
  catch (error) {
    if (error && typeof error === "object" && "statusCode" in error) throw error;

    handleError(error, "Generate Invoice PDF", event);
  }
});

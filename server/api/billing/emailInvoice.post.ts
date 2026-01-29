import type { Buffer } from "node:buffer";

import { billingQueries } from "~~/server/db/queries";
import { formatDate, formatMoney } from "~~/server/utils/formatters";
import { getInvoiceEmailTemplate } from "~~/server/utils/invoiceEmailTemplate";
import { emailInvoiceSchema } from "~~/shared/utils/schema";

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event, {
    message: "Unauthorized Access: Please log in to continue.",
  });
  try {
    const body = await readValidatedBody(event, body => emailInvoiceSchema.safeParse(body));
    if (!body.success) {
      throw createError({
        statusCode: 400,
        message: body.error.issues.map(i => i.message).join(", "),
      });
    }

    const { billingId, email } = body.data;

    const { getBillingById } = await billingQueries();

    const billing = await getBillingById(billingId);

    if (!billing) {
      throw createError({
        statusCode: 404,
        message: "Billing record not found",
      });
    }

    const isAdmin = user.role === "admin";
    const isOwner = user.role === "student" && billing.student.userId === user.id;

    if (!isAdmin && !isOwner) {
      throw createError({
        statusCode: 403,
        message: "Access denied",
      });
    }

    let pdfBuffer: Buffer;
    try {
      pdfBuffer = await generateInvoicePDF(billing);
    }
    catch (error) {
      console.error("PDF Generation failed:", error);
      throw createError({ statusCode: 500, message: "Failed to generate invoice PDF" });
    }

    const runtimeConfig = useRuntimeConfig();

    const invoiceNumber = billing.invoiceNumber || `INV-${String(billing.id).padStart(6, "0")}`;
    const studentEmail = billing.student?.user?.email;
    const studentName = billing.student?.user?.name || "Student";

    if (!studentEmail || studentEmail !== email) {
      throw createError({ statusCode: 400, message: "Student email address is missing or does not match" });
    }

    const amountTotal = formatMoney(Number(billing.amount));
    const amountPaid = formatMoney(Number(billing.paidAmount || 0));
    const amountDue = formatMoney(Number(billing.amount) - Number(billing.paidAmount || 0));
    const dateIssued = formatDate(billing.dateIssued);
    const dateDue = formatDate(billing.dueDate);

    const { htmlTemplate, textTemplate } = getInvoiceEmailTemplate(
      studentName,
      invoiceNumber,
      formatMoney(billing.amount),
      formatDate(billing.dueDate),
      dateIssued,
      dateDue,
      amountTotal,
      amountPaid,
      amountDue,
    );

    const emailSubject = `Invoice #${invoiceNumber} from Kings Hostel`;

    try {
      if (import.meta.dev) {
        const { sendMail } = useNodeMailer();
        await sendMail({
          to: email,
          subject: emailSubject,
          html: htmlTemplate,
          text: textTemplate,
          attachments: [
            {
              filename: `invoice-${invoiceNumber}.pdf`,
              content: pdfBuffer,
            },
          ],
        });
      }
      else {
        const mailer = await useWorkerMailer();

        await mailer.send({
          from: { name: runtimeConfig.emailFromName, email: runtimeConfig.emailFromEmail },
          to: { name: studentName, email },
          subject: emailSubject,
          html: htmlTemplate,
          text: textTemplate,
          attachments: [
            {
              filename: `invoice-${invoiceNumber}.pdf`,
              content: pdfBuffer.toString("base64"),
              mimeType: "application/pdf",
            },
          ],
        });
      }
    }
    catch (emailError) {
      console.error("Failed to send email:", emailError);
    }

    return { success: true };
  }
  catch (error) {
    if (error && typeof error === "object" && "statusCode" in error) throw error;

    handleError(error, "Generate Invoice PDF", event);
  }
});

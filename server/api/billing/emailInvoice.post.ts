import { formatDate, formatMoney } from "~~/server/utils/formatters";
import { getInvoiceEmailTemplate } from "~~/server/utils/invoiceEmailTemplate";
import { emailInvoiceSchema } from "~~/shared/utils/schema";

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event, {
    message: "Unauthorized Access: Please log in to continue.",
  });
  try {
    const body = await readMultipartFormData(event);
    if (!body) {
      throw createError({
        statusCode: 400,
        message: "No file uploaded",
      });
    }

    const getField = (name: string) => body.find(p => p.name === name)?.data.toString();

    const filePart = body.find(p => p.name === "file");

    if (!filePart) throw createError({ statusCode: 400, message: "PDF missing" });

    const rawData = {
      studentEmail: getField("studentEmail"),
      studentName: getField("studentName"),
      invoiceNumber: getField("invoiceNumber"),
      studentUserId: getField("studentUserId") ? Number(getField("studentUserId")) : undefined,
      amountTotal: getField("amountTotal") ? Number(getField("amountTotal")) : undefined,
      amountPaid: getField("amountPaid") ? Number(getField("amountPaid")) : undefined,
      amountDue: getField("amountDue") ? Number(getField("amountDue")) : undefined,
      dateIssued: getField("dateIssued"),
      dateDue: getField("dateDue"),
      amount: getField("amount") ? Number(getField("amount")) : undefined,
    };

    const validatedData = emailInvoiceSchema.safeParse(rawData);

    if (!validatedData.success) {
      throw createError({
        statusCode: 400,
        message: `Invalid request data: ${validatedData.error.issues
          .map(i => i.message)
          .join(", ")}`,
      });
    }

    const {
      studentEmail,
      studentName,
      invoiceNumber,
      studentUserId,
      amountTotal,
      amountPaid,
      dateIssued,
      dateDue,
      amountDue,
    } = validatedData.data;

    const isAdmin = user.role === "admin";
    const isOwner = user.role === "student" && Number(studentUserId) === user.id;

    if (!isAdmin && !isOwner) {
      throw createError({
        statusCode: 403,
        message: "Access denied",
      });
    }

    const runtimeConfig = useRuntimeConfig();

    const { htmlTemplate, textTemplate } = getInvoiceEmailTemplate(
      studentName,
      invoiceNumber,
      formatDate(dateIssued),
      formatDate(dateDue),
      formatMoney(amountTotal),
      formatMoney(amountPaid),
      formatMoney(amountDue),
    );

    const emailSubject = `Invoice #${invoiceNumber} from Kings Hostel`;

    try {
      if (import.meta.dev) {
        const { sendMail } = useNodeMailer();
        await sendMail({
          to: studentEmail,
          subject: emailSubject,
          html: htmlTemplate,
          text: textTemplate,
          attachments: [{ filename: filePart.filename, content: filePart.data }],
        });
      }
      else {
        const mailer = await useWorkerMailer();

        await mailer.send({
          from: { name: runtimeConfig.emailFromName, email: runtimeConfig.emailFromEmail },
          to: { name: studentName, email: studentEmail },
          subject: emailSubject,
          html: htmlTemplate,
          text: textTemplate,
          attachments: [
            {
              filename: `invoice-${invoiceNumber}.pdf`,
              content: filePart.data.toString("base64"),
              mimeType: "application/pdf",
            },
          ],
        });
      }
    }
    catch (emailError) {
      console.error("Failed to send email:", emailError);
    }

    return {
      success: true,
      message: `Invoice email sent to ${studentEmail} successfully.`,
    };
  }
  catch (error) {
    if (error && typeof error === "object" && "statusCode" in error) throw error;

    handleError(error, "Generate Invoice PDF", event);
  }
});

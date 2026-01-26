import { getLocalTimeZone, today } from "@internationalized/date";
import { billingQueries, roomQueries } from "~~/server/db/queries";

export default defineEventHandler(async (event) => {
  const { adminData } = await adminSessionCheck(event);

  const runtimeConfig = useRuntimeConfig(event);

  try {
    const body = await readValidatedBody(event, body => createBillingSchema.omit({ paymentTerms: true }).safeParse(body));

    if (!body.success) {
      throw createError({
        statusCode: 400,
        message: `${body.error.issues
          .map(i => i.message)
          .join(", ")}`,
      });
    }

    const { studentId, amount, academicPeriod, description, dueDate, type, sendNotification } = body.data;

    const { createBilling } = await billingQueries();
    const { getAllcoationByStudentId } = await roomQueries();

    const now = today(getLocalTimeZone());

    if (dueDate.compare(now) < 0) {
      throw createError({
        statusCode: 400,
        message: "Due date cannot be in the past.",
      });
    }

    const studentAllocation = await getAllcoationByStudentId(studentId);

    if (!studentAllocation) {
      throw createError({
        statusCode: 404,
        statusMessage: "No active allocation found for this student.",
        data: { reason: "Student must have an active room allocation to be billed." },
      });
    }

    const studentHostelId = studentAllocation.room.hostelId;

    if (adminData.accessLevel !== "super") {
      if (!adminData.hostelId) {
        throw createError({ statusCode: 403, statusMessage: "Admin not assigned to any hostel" });
      }

      if (studentHostelId !== adminData.hostelId) {
        throw createError({
          statusCode: 403,
          statusMessage: "Unauthorized",
          data: { message: "You can only create bills for students in your assigned hostel." },
        });
      }
    }

    const newBilling = await createBilling({
      studentId,
      allocationId: studentAllocation.id,
      hostelId: studentHostelId,
      amount: amount.toString(),
      academicPeriod,
      description,
      status: "unpaid",
      dueDate: dueDate.toString(),
      type,
    });

    if (sendNotification) {
      const studentEmail = studentAllocation.student.user.email;
      const studentName = studentAllocation.student.user.name;

      try {
        if (import.meta.dev) {
          const { sendMail } = useNodeMailer();

          await sendMail({
            to: studentEmail,
            subject: "New Billing Created - Kings Hostel Management",
            html: `
          <h1>Hello ${studentName},</h1>
          <p>A new invoice has been generated for your stay at ${studentAllocation.room.hostel.name}.</p>
          <ul>
            <li><strong>Amount:</strong> ${amount}</li>
            <li><strong>Purpose:</strong> ${type}</li>
            <li><strong>Due Date:</strong> ${dueDate.toString()}</li>
          </ul>
          <p>Please login to your dashboard to view details and make payment.</p>
        `,
          });
        }
        else {
          const mailer = await useWorkerMailer();

          await mailer.send({
            from: { name: runtimeConfig.emailFromName, email: runtimeConfig.emailFromEmail },
            to: { name: studentName, email: studentEmail },
            subject: "New Billing Created - Kings Hostel Management",
            html: `<h1>Hello ${studentName},</h1>
          <p>A new invoice has been generated for your stay at ${studentAllocation.room.hostel.name}.</p>
          <ul>
            <li><strong>Amount:</strong> ${amount}</li>
            <li><strong>Purpose:</strong> ${type}</li>
            <li><strong>Due Date:</strong> ${dueDate.toString()}</li>
          </ul>
          <p>Please login to your dashboard to view details and make payment.</p>`,
            text: `Hello ${studentName},\nA new invoice has been generated for your stay at ${studentAllocation.room.hostel.name}.\nAmount: ${amount}\nPurpose: ${type}\nDue Date: ${dueDate.toString()}\nPlease login to your dashboard to view details and make payment.`,
          });
        }
      }
      catch (emailError) {
        console.error("Failed to send verification email:", emailError);
      }
    }

    return {
      success: true,
      message: "Billing created successfully.",
      data: newBilling,
    };
  }
  catch (error) {
    if (error && typeof error === "object" && "statusCode" in error) throw error;

    handleError(error, "Create Billing", event);
  }
});

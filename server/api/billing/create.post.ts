import { getLocalTimeZone, today } from "@internationalized/date";
import { billingQueries, roomQueries } from "~~/server/db/queries";

export default defineEventHandler(async (event) => {
  const { adminData } = await adminSessionCheck(event);
  const runtimeConfig = useRuntimeConfig(event);

  try {
    const body = await readValidatedBody(event, body => createBillingSchema.safeParse(body));

    if (!body.success) {
      throw createError({
        statusCode: 400,
        message: body.error.issues.map(i => i.message).join(", "),
      });
    }

    const {
      studentId,
      amount,
      academicPeriod,
      description,
      dueDate,
      type,
      sendNotification,
      target,
    } = body.data;

    const { createBilling, createManyBillings } = await billingQueries();
    const { getAllcoationByStudentId, getAllActiveAllocations } = await roomQueries();

    // 1. Date Validation
    const now = today(getLocalTimeZone());
    if (dueDate.compare(now) < 0) {
      throw createError({ statusCode: 400, message: "Due date cannot be in the past." });
    }

    // Helper to send the notification (defined inside to access runtimeConfig/composables)
    const sendNotificationEmail = async (studentName: string, studentEmail: string, hostelName: string) => {
      try {
        const emailContent = {
          subject: "New Billing Created - Kings Hostel Management",
          html: `
            <h1>Hello ${studentName},</h1>
            <p>A new invoice has been generated for your stay at ${hostelName}.</p>
            <ul>
              <li><strong>Amount:</strong> GHS ${amount}</li>
              <li><strong>Purpose:</strong> ${type}</li>
              <li><strong>Due Date:</strong> ${dueDate.toString()}</li>
            </ul>
            <p>Please login to your dashboard to view details and make payment.</p>
          `,
          text: `Hello ${studentName},\nA new invoice has been generated for your stay at ${hostelName}.\nAmount: ${amount}\nPurpose: ${type}\nDue Date: ${dueDate.toString()}\nPlease login to your dashboard to view details and make payment.`,
        };

        if (import.meta.dev) {
          const { sendMail } = useNodeMailer();
          await sendMail({ to: studentEmail, ...emailContent });
        }
        else {
          const mailer = await useWorkerMailer();
          await mailer.send({
            from: { name: runtimeConfig.emailFromName, email: runtimeConfig.emailFromEmail },
            to: { name: studentName, email: studentEmail },
            ...emailContent,
          });
        }
      }
      catch (e) {
        console.error(`Failed to send billing email to ${studentEmail}:`, e);
      }
    };

    // --- CASE A: BILL ALL ACTIVE STUDENTS ---
    if (target === "all") {
      const targetHostelId = adminData.accessLevel === "super" ? undefined : (adminData.hostelId as number);
      const activeAllocations = await getAllActiveAllocations(targetHostelId);

      if (!activeAllocations.length) {
        return { success: true, message: "No active students found to bill." };
      }

      const billingsToInsert = activeAllocations.map(alloc => ({
        studentId: alloc.studentId,
        allocationId: alloc.id,
        hostelId: alloc.room.hostelId,
        amount: amount.toString(),
        description,
        dueDate: dueDate.toString(),
        status: "unpaid" as const,
        type,
        academicPeriod,
        paidAmount: "0.00",
        dateIssued: new Date(),
      }));

      const newBillings = await createManyBillings(billingsToInsert);

      // 2. Optimization: Offload emails to background process
      if (sendNotification) {
        event.waitUntil((async () => {
          // Send emails in small chunks or all at once depending on provider limits
          // Using Promise.all with map for efficiency
          await Promise.allSettled(
            activeAllocations.map(alloc =>
              sendNotificationEmail(alloc.student.user.name, alloc.student.user.email, alloc.room.hostel.name),
            ),
          );
        })());
      }

      return {
        success: true,
        message: `Successfully created billings for ${newBillings.length} students. Notifications are being sent in the background.`,
        count: newBillings.length,
      };
    }

    // --- CASE B: SINGLE STUDENT BILLING ---
    else {
      if (!studentId) {
        throw createError({ statusCode: 400, message: "Student ID is required for single billing." });
      }

      const studentAllocation = await getAllcoationByStudentId(studentId);
      if (!studentAllocation) {
        throw createError({
          statusCode: 404,
          statusMessage: "No active allocation found for this student.",
        });
      }

      // Authorization check
      if (adminData.accessLevel !== "super" && studentAllocation.room.hostelId !== adminData.hostelId) {
        throw createError({ statusCode: 403, statusMessage: "Unauthorized to bill students in other hostels." });
      }

      const newBilling = await createBilling({
        studentId,
        allocationId: studentAllocation.id,
        hostelId: studentAllocation.room.hostelId,
        amount: amount.toString(),
        academicPeriod,
        description,
        status: "unpaid",
        dueDate: dueDate.toString(),
        type,
        paidAmount: "0.00",
        dateIssued: new Date(),
      });

      // 3. Background single email too for faster response time
      if (sendNotification) {
        event.waitUntil(
          sendNotificationEmail(
            studentAllocation.student.user.name,
            studentAllocation.student.user.email,
            studentAllocation.room.hostel.name,
          ),
        );
      }

      return {
        success: true,
        message: "Billing created successfully. Notification is being sent.",
        data: newBilling,
      };
    }
  }
  catch (error) {
    if (error && typeof error === "object" && "statusCode" in error) throw error;
    handleError(error, "Create Billing", event);
  }
});

import { getLocalTimeZone, today } from "@internationalized/date";
import { userQueries, visitorQueries } from "~~/server/db/queries";

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event, {
    message: "Unauthorized Access: Please log in to continue.",
  });

  try {
    if (user.role !== "student") {
      throw createError({
        statusCode: 403,
        message: "Access denied: Only students can register for a visitor pass.",
      });
    }

    const body = await readValidatedBody(event, body => registerVisitorSchema
      .omit({ status: true, hostelId: true, studentId: true })
      .safeParse(body));

    if (!body.success) {
      throw createError({
        statusCode: 400,
        message: `${body.error.issues
          .map(i => i.message)
          .join(", ")}`,
      });
    }

    const { visitDate, ...formData } = body.data;

    const now = today(getLocalTimeZone());

    if (visitDate.compare(now) < 0) {
      throw createError({
        statusCode: 400,
        message: "Date of visit cannot be in the past.",
      });
    }

    const { getStudentForDashboardByUserId } = await userQueries();
    const { createVisitor } = await visitorQueries();

    const studentData = await getStudentForDashboardByUserId(user.id);

    if (!studentData) {
      throw createError({
        statusCode: 404,
        message: "Student Not Found: Unable to retrieve student data.",
      });
    }

    const student = studentData.studentRecord;

    if (!student.allocation || !student.allocation.room || !student.allocation.room.hostel) {
      throw createError({
        statusCode: 403,
        message: "Access denied: You must have an active room allocation to register a visitor.",
      });
    }

    if (student.allocation.status !== "active" || student.residencyStatus !== "active") {
      throw createError({
        statusCode: 403,
        message: "Access denied: Only active hostel residents can register a visitor.",
      });
    }

    const data: VisitorCreate = {
      ...formData,
      status: "pending" as const,
      hostelId: student.allocation.room.hostel.id,
      studentId: student.id,
      visitDate: visitDate.toString(),
    };

    const visitor = await createVisitor(data);

    return {
      success: true,
      message: "Visitor registered successfully.",
      data: visitor,
    };
  }
  catch (error) {
    if (error && typeof error === "object" && "statusCode" in error) throw error;

    handleError(error, "Register Visitor", event);
  }
});

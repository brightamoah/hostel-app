import { maintenanceQueries, userQueries } from "~~/server/db/queries";

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event, {
    message: "Unauthorized Access: Please log in to continue.",
  });

  if (user.role !== "student") {
    throw createError({
      statusCode: 403,
      message: "Forbidden: This endpoint is only accessible to students.",
    });
  }

  try {
    const body = await readValidatedBody(event, body =>
      createMaintenanceSchema.safeParse(body));

    if (!body.success) {
      throw createError({
        statusCode: 400,
        message: body.error.issues.map(i => i.message).join(", "),
      });
    }

    const {
      studentId,
      description,
      hostelId,
      issueType,
      priority,
      roomId,
    } = body.data;

    if (issueType === "" || priority === "") {
      throw createError({
        statusCode: 400,
        message: "Issue Type and Priority are required fields and cannot be empty.",
      });
    }

    const { getStudentByUserId } = await userQueries();
    const { createMaintenance } = await maintenanceQueries();

    const student = await getStudentByUserId(user.id);

    if (!student) {
      throw createError({
        statusCode: 404,
        message: "Student Not Found: Unable to retrieve student data.",
      });
    }

    if (studentId !== student.id) {
      throw createError({
        statusCode: 403,
        message: "You cannot create a request for another student.",
      });
    }

    const result = await createMaintenance({
      studentId,
      description,
      hostelId,
      issueType,
      priority,
      roomId,
    });

    return {
      success: true,
      message: "Maintenance request created successfully.",
      data: result,
    };
  }
  catch (error) {
    if (error && typeof error === "object" && "statusCode" in error) throw error;

    handleError(error, "Create Maintenance", event);
  }
});

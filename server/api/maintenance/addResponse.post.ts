import { maintenanceQueries, userQueries } from "~~/server/db/queries";

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event, {
    message: "Unauthorized Access: Please log in to continue.",
  });

  const { user } = session;

  try {
    const body = await readValidatedBody(event, body => maintenanceStatusResponseSchema.pick({ maintenanceId: true, responseText: true }).safeParse(body));

    if (!body.success) {
      throw createError({
        statusCode: 400,
        message: `${body.error.issues
          .map(i => i.message)
          .join(", ")}`,
      });
    }

    const { responseText, maintenanceId } = body.data;

    const { addMaintenanceResponse, findMaintenanceRequestById } = await maintenanceQueries();
    const { getAdminByUserId, getStudentByUserId } = await userQueries();

    const request = await findMaintenanceRequestById(maintenanceId);
    if (!request) {
      throw createError({
        statusCode: 404,
        message: "Maintenance request not found.",
      });
    }

    const admin = await getAdminByUserId(user.id);

    if (admin) {
      if (admin.accessLevel !== "super" && admin.hostelId !== request.hostelId) {
        throw createError({
          statusCode: 403,
          message: "You do not have permission to respond to requests for this hostel.",
        });
      }
    }
    else {
      const student = await getStudentByUserId(user.id);

      if (!student || student.id !== request.studentId) {
        throw createError({
          statusCode: 403,
          message: "You can only respond to your own maintenance requests.",
        });
      }
    }

    const newResponse = await addMaintenanceResponse(
      maintenanceId,
      user.id,
      responseText,
    );

    return {
      success: true,
      message: "Your response has been added successfully.",
      response: newResponse,
    };
  }
  catch (error) {
    if (error && typeof error === "object" && "statusCode" in error) {
      throw error;
    }

    handleError(error, "Add Maintenance Response", event);
  }
});

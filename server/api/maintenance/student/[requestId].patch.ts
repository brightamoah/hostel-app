import { maintenanceQueries } from "~~/server/db/queries";

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

  const idFromParam = Number(getRouterParam(event, "requestId"));

  if (Number.isNaN(idFromParam) || idFromParam <= 0) {
    throw createError({
      statusCode: 400,
      message: "Invalid Request ID: The provided request ID is not valid.",
    });
  }

  try {
    const body = await readValidatedBody(event, body => editMaintenanceSchema.safeParse(body));

    if (!body.success) {
      throw createError({
        statusCode: 400,
        message: body.error.issues.map(i => i.message).join(", "),
      });
    }

    const { maintenanceId, data, studentId } = body.data;

    if (maintenanceId !== idFromParam) {
      throw createError({
        statusCode: 400,
        message: "Request ID Mismatch: The request ID in the body does not match the URL parameter.",
      });
    }

    if (data.issueType === "" || data.priority === "") {
      throw createError({
        statusCode: 400,
        message: "Issue Type and Priority cannot be empty strings.",
      });
    }

    const { updateMaintenance, getMaintenanceByIdForStudent } = await maintenanceQueries();

    const updatedMaintenance = await updateMaintenance(
      maintenanceId,
      studentId,
      data as Parameters<typeof updateMaintenance>[2],
    );

    if (!updatedMaintenance) {
      const existingMaintenance = await getMaintenanceByIdForStudent(maintenanceId, studentId);

      if (!existingMaintenance) {
        throw createError({
          statusCode: 404,
          message: "Maintenance Request Not Found: Unable to find the specified maintenance request.",
        });
      }

      throw createError({
        statusCode: 403,
        message: "Forbidden: You do not have permission to update this maintenance request.",
      });
    }

    return {
      success: true,
      message: `Maintenance request with ID ${updatedMaintenance.id} updated successfully.`,
    };
  }
  catch (error) {
    if (error && typeof error === "object" && "statusCode" in error) throw error;

    handleError(error, "Update Maintenance Request", event);
  }
});

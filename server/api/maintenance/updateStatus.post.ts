import { maintenanceQueries, userQueries } from "~~/server/db/queries";

export default defineEventHandler(async (event) => {
  const { userId } = await adminSessionCheck(event);

  try {
    const body = await readValidatedBody(event, body => maintenanceStatusResponseSchema.safeParse(body));

    if (!body.success) {
      throw createError({
        statusCode: 400,
        message: `${body.error.issues
          .map(i => i.message)
          .join(", ")}`,
      });
    }

    const { maintenanceId, status, responseText } = body.data;

    if (status === "") {
      throw createError({
        statusCode: 400,
        message: "Status cannot be empty.",
      });
    }

    const { updateStatusAndAddResponse, getMaintenanceById } = await maintenanceQueries();
    const { getAdminByUserId } = await userQueries();

    const adminMakingRequest = await getAdminByUserId(
      userId,
      true,
    );

    if (!adminMakingRequest) {
      throw createError({
        statusCode: 403,
        message: "Account for the admin making the request not found or is inactive.",
      });
    }

    const hostelId = adminMakingRequest.accessLevel === "super"
      ? undefined
      : adminMakingRequest.hostelId!;

    const maintenanceToUpdate = await getMaintenanceById(maintenanceId, adminMakingRequest);

    if (!maintenanceToUpdate) {
      throw createError({
        statusCode: 404,
        message: "Maintenance request not found.",
      });
    }

    if (maintenanceToUpdate.status === "completed") {
      throw createError({
        statusCode: 400,
        message: "Cannot update a completed maintenance request.",
      });
    }

    if (status === maintenanceToUpdate.status) {
      throw createError({
        statusCode: 400,
        message: `The maintenance request is already marked as '${status}'. Please choose a different status.`,
      });
    }

    const { updatedRequest, newResponse } = await updateStatusAndAddResponse(
      maintenanceId,
      adminMakingRequest.id,
      status,
      responseText,
      hostelId,
    );

    return {
      success: true,
      message: "Maintenance request status and response updated successfully.",
      updatedRequest,
      newResponse,
    };
  }
  catch (error) {
    if (error && typeof error === "object" && "statusCode" in error) throw error;

    handleError(error, "Update Maintenance Status/Response", event);
  }
});

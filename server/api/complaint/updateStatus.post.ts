import { complaintQueries, userQueries } from "~~/server/db/queries";

export default defineEventHandler(async (event) => {
  const { userId } = await adminSessionCheck(event);

  try {
    const body = await readValidatedBody(event, body => complaintStatusResponseSchema.safeParse(body));

    if (!body.success) {
      throw createError({
        statusCode: 400,
        message: `${body.error.issues
          .map(i => i.message)
          .join(", ")}`,
      });
    }

    const { complaintId, status, responseText } = body.data;

    if (status === "") {
      throw createError({
        statusCode: 400,
        message: "Status cannot be empty.",
      });
    }

    const { updateStatusAndAddResponse, getComplaintById } = await complaintQueries();
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

    const complaintToUpdate = await getComplaintById(complaintId, adminMakingRequest);

    if (!complaintToUpdate) {
      throw createError({
        statusCode: 404,
        message: "Complaint not found.",
      });
    }

    if (complaintToUpdate.status === "resolved") {
      throw createError({
        statusCode: 400,
        message: "Cannot update a resolved complaint.",
      });
    }

    if (status === complaintToUpdate.status) {
      throw createError({
        statusCode: 400,
        message: `The complaint is already marked as ${status}. Please choose a different status.`,
      });
    }

    const { updatedComplaint, newResponse } = await updateStatusAndAddResponse(
      complaintId,
      adminMakingRequest.id,
      status,
      responseText,
      hostelId,
    );

    return {
      success: true,
      message: "Complaint status and response updated successfully.",
      updatedComplaint,
      newResponse,
    };
  }
  catch (error) {
    if (error && typeof error === "object" && "statusCode" in error)
      throw error;

    handleError(error, "Add Maintenance Response", event);
  }
});

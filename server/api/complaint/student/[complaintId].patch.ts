import { complaintQueries } from "~~/server/db/queries";

export default defineEventHandler(async (event) => {
  await studentSessionCheck(event);

  const idFromParam = Number(getRouterParam(event, "complaintId"));

  if (Number.isNaN(idFromParam) || idFromParam <= 0) {
    throw createError({
      statusCode: 400,
      message: "Invalid Request ID: The provided request ID is not valid.",
    });
  }

  try {
    const body = await readValidatedBody(event, body => editComplaintSchema.safeParse(body));

    if (!body.success) {
      throw createError({
        statusCode: 400,
        message: body.error.issues.map(i => i.message).join(", "),
      });
    }

    const { complaintId, data, studentId } = body.data;

    if (complaintId !== idFromParam) {
      throw createError({
        statusCode: 400,
        message: "Complaint ID Mismatch: The complaint ID in the body does not match the URL parameter.",
      });
    }

    if (data.priority === "") {
      throw createError({
        statusCode: 400,
        message: "Priority cannot be an empty string.",
      });
    }

    const { updateComplaint, getComplaintForStudentById } = await complaintQueries();

    const updatedComplaint = await updateComplaint(
      complaintId,
      studentId,
      data as Parameters<typeof updateComplaint>[2],
    );

    if (!updatedComplaint) {
      const existingComplaint = await getComplaintForStudentById(complaintId, studentId);

      if (!existingComplaint) {
        throw createError({
          statusCode: 404,
          message: "Complaint Not Found: Unable to find the specified complaint.",
        });
      }

      throw createError({
        statusCode: 403,
        message: "Forbidden: You do not have permission to update this complaint.",
      });
    }

    return {
      success: true,
      message: `Complaint with ID ${updatedComplaint.id} updated successfully.`,
    };
  }
  catch (error) {
    if (error && typeof error === "object" && "statusCode" in error) throw error;

    handleError(error, "Update Complaint", event);
  }
});

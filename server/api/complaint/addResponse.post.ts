import { complaintQueries } from "~~/server/db/queries";

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event, {
    message: "Unauthorized Access: Please log in to continue.",
  });

  const { user } = session;

  try {
    const body = await readValidatedBody(event, body => complaintStatusResponseSchema.pick({ complaintId: true, responseText: true }).safeParse(body));

    if (!body.success) {
      throw createError({
        statusCode: 400,
        message: `${body.error.issues
          .map(i => i.message)
          .join(", ")}`,
      });
    }

    const { responseText, complaintId } = body.data;

    const { addComplaintResponse, getComplaintByIdNoScope } = await complaintQueries();

    const complaint = await getComplaintByIdNoScope(complaintId);

    if (!complaint) {
      throw createError({
        statusCode: 404,
        message: "Complaint not found.",
      });
    }

    if (user.role === "admin") {
      const admin = user.adminData;

      if (!admin) throw createError({ statusCode: 403, message: "Admin profile missing." });

      if (admin.accessLevel !== "super" && admin.hostelId !== complaint.hostelId) {
        throw createError({
          statusCode: 403,
          message: "You do not have permission to respond to complaints for this hostel.",
        });
      }
    }
    else if (user.role === "student") {
      if (!user.studentId) throw createError({ statusCode: 403, message: "Student Id missing." });

      if (user.studentId !== complaint.studentId) {
        throw createError({
          statusCode: 403,
          message: "You can only respond to your own complaints.",
        });
      }
    }

    const newResponse = await addComplaintResponse(
      complaintId,
      user.id,
      responseText,
    );

    return {
      success: true,
      message: `Your response to complaint with ID: ${complaintId} has been added successfully.`,
      response: newResponse,
    };
  }
  catch (error) {
    if (error && typeof error === "object" && "statusCode" in error) throw error;

    handleError(error, "Add Maintenance Response", event);
  }
});

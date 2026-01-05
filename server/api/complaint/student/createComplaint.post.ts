import { complaintQueries } from "~~/server/db/queries";

export default defineEventHandler(async (event) => {
  await studentSessionCheck(event);

  try {
    const body = await readValidatedBody(event, body => createComplaintSchema.safeParse(body));

    if (!body.success) {
      throw createError({
        statusCode: 400,
        message: `${body.error.issues
          .map(i => i.message)
          .join(", ")}`,
      });
    }

    const { priority, ...rest } = body.data;

    if (priority === "") {
      throw createError({
        statusCode: 400,
        message: "Priority is required and cannot be empty.",
      });
    }

    const { createComplaint } = await complaintQueries();

    const result = await createComplaint({
      priority,
      ...rest,
    });

    const { id, createdAt, status } = result;

    return {
      success: true,
      message: "New Complaint created successfully",
      data: {
        id,
        createdAt,
        status,
      },
    };
  }
  catch (error) {
    if (error && typeof error === "object" && "statusCode" in error) throw error;

    handleError(error, "Create New Complaint", event);
  }
});

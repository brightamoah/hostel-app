import { getLocalTimeZone, today } from "@internationalized/date";
import { visitorQueries } from "~~/server/db/queries";

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
    const idFromParams = Number(getRouterParams(event).visitorId);

    const body = await readValidatedBody(event, body => editVisitorSchema.safeParse(body));

    if (!body.success) {
      throw createError({
        statusCode: 400,
        message: `${body.error.issues
          .map(i => i.message)
          .join(", ")}`,
      });
    }

    const { visitorId, data } = body.data;

    if (visitorId !== idFromParams) {
      throw createError({
        statusCode: 400,
        message: "Visitor ID in the URL does not match the ID in the request body.",
      });
    }

    const { visitDate, ...rest } = data;

    const payload = { ...rest };

    if (visitDate) {
      const now = today(getLocalTimeZone());

      if (visitDate.compare(now) < 0) {
        throw createError({
          statusCode: 400,
          message: "Date of visit cannot be in the past.",
        });
      }

      Object.assign(payload, { visitDate: visitDate.toString() });
    }

    const { updateVisitor, getVisitorForStudentById } = await visitorQueries();

    const updatedVisitor = await updateVisitor(visitorId, payload);

    if (!updatedVisitor) {
      const existingVisitor = await getVisitorForStudentById(visitorId);

      if (!existingVisitor) {
        throw createError({
          statusCode: 404,
          message: "Visitor not found.",
        });
      }

      throw createError({
        statusCode: 403,
        message: "You are not authorized to edit this visitor.",
      });
    }

    return {
      success: true,
      message: `Visitor with ID ${idFromParams} has been updated successfully.`,
    };
  }
  catch (error) {
    if (error && typeof error === "object" && "statusCode" in error) throw error;

    handleError(error, "Update Visitor", event);
  }
});

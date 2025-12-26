export default defineEventHandler(async (event) => {
  const { adminData } = await adminSessionCheck(event);

  try {
    if (!adminData) {
      throw createError({
        statusCode: 403,
        message: "Account for the admin making the request not found or is inactive.",
      });
    }

    const body = await readValidatedBody(event, body => approveDenySchema.safeParse(body));

    if (!body.success) {
      throw createError({
        statusCode: 400,
        message: `${body.error.issues
          .map(i => i.message)
          .join(", ")}`,
      });
    }

    const { visitorId, status } = body.data;

    const updatedVisitor = await updateVisitorStatus(visitorId, status, adminData);

    return {
      success: true,
      message: `Visitor has been successfully ${status}.`,
      visitor: updatedVisitor,
    };
  }
  catch (error) {
    if (error && typeof error === "object" && "statusCode" in error) throw error;

    handleError(error, "Approve/Deny Visitor", event);
  }
});

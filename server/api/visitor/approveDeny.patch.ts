import { userQueries, visitorQueries } from "~~/server/db/queries";

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event);

  if (
    !session
    || !session.user
    || session.user.role !== "admin"
    || !session.user.adminData
    || session.user.adminData.status !== "active") {
    throw createError({
      statusCode: 403,
      message: "Access denied: Must be a verified active admin",
    });
  }

  const userId = session.user.id;

  try {
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

    const { getAdminByUserId } = await userQueries();
    const { updateVisitorStatus } = await visitorQueries();

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

    const updatedVisitor = await updateVisitorStatus(visitorId, status, adminMakingRequest);

    return {
      success: true,
      message: `Visitor has been successfully ${status}.`,
      visitor: updatedVisitor,
    };
  }
  catch (error) {
    if (error && typeof error === "object" && "statusCode" in error) {
      throw error;
    }

    handleError(error, "Approve/Deny Visitor", event);
  }
});

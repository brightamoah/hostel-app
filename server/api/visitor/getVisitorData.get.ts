import { userQueries } from "~~/server/db/queries/user";
import { visitorQueries } from "~~/server/db/queries/visitor";

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event);

  if (!session
    || !session.user
    || session.user.role !== "admin"
    || !session.user.adminData
    || session.user.adminData.status !== "active") {
    throw createError({
      statusCode: 403,
      message: "Access denied: Must be a verified active admin",
    });
  }

  try {
    const { getAdminByUserId } = await userQueries(event);
    const { getScopedVisitors, getVisitorStatusCount } = await visitorQueries(event);
    const currentUserId = session.user.id;

    const adminMakingRequest = await getAdminByUserId(
      currentUserId,
      true,
    );

    if (!adminMakingRequest) {
      throw createError({
        statusCode: 403,
        message: "Account for the admin making the request not found or is inactive.",
      });
    }

    const visitors = await getScopedVisitors(adminMakingRequest);

    const { approved, checkedIn, pending } = await getVisitorStatusCount(adminMakingRequest);

    return {
      visitors,
      approved,
      checkedIn,
      pending,
      message: `Fetched visitor data for ${adminMakingRequest.accessLevel} admin`,
    };
  }
  catch (error) {
    if (error && typeof error === "object" && "statusCode" in error) {
      throw error;
    }

    handleError(error, "Get Visitor Data", event);
  }
});

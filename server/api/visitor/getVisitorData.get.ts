import { userQueries } from "~~/server/db/queries/user";
import { visitorQueries } from "~~/server/db/queries/visitor";

export default defineEventHandler(async (event) => {
  const { userId } = await adminSessionCheck(event);

  try {
    const { getAdminByUserId } = await userQueries();
    const { getScopedVisitors, getVisitorStatusCount } = await visitorQueries();

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

    const [
      visitors,
      {
        approved,
        checkedIn,
        pending,
        totalVisitors,
      },
    ]
      = await Promise.all([
        getScopedVisitors(adminMakingRequest),
        getVisitorStatusCount(adminMakingRequest),
      ]);

    return {
      visitors,
      approved,
      checkedIn,
      pending,
      totalVisitors,
      message: `Fetched visitor data for ${adminMakingRequest.accessLevel} admin`,
    };
  }
  catch (error) {
    if (error && typeof error === "object" && "statusCode" in error) throw error;

    handleError(error, "Get Visitor Data", event);
  }
});

import { userQueries } from "~~/server/db/queries";
import { maintenanceQueries } from "~~/server/db/queries/maintenance";

export default defineEventHandler(async (event) => {
  const { userId } = await checkAdminSession(event);

  try {
    const { getAdminByUserId } = await userQueries();
    const { getAllMaintenanceRequests, getMaintenanceStatusCount } = await maintenanceQueries();

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

    const maintenanceRequests = await getAllMaintenanceRequests(adminMakingRequest);

    const {
      totalMaintenance,
      inProgress,
      assigned,
      pending,
      completed,
      rejected,
    } = await getMaintenanceStatusCount(adminMakingRequest);

    return {
      maintenanceRequests,
      totalMaintenance,
      inProgress,
      assigned,
      pending,
      completed,
      rejected,
    };
  }
  catch (error) {
    if (error && typeof error === "object" && "statusCode" in error) {
      throw error;
    }

    handleError(error, "Get Visitor Data", event);
  }
});

import { complaintQueries, userQueries } from "~~/server/db/queries";

export default defineEventHandler(async (event) => {
  const { userId } = await adminSessionCheck(event);

  try {
    const {
      getComplaintStatusCount,
      getAllComplaints,
    } = await complaintQueries();

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

    const complaints = await getAllComplaints(adminMakingRequest);

    const {
      totalComplaints,
      totalInProgress,
      totalPending,
      totalResolved,
    } = await getComplaintStatusCount(adminMakingRequest);

    return {
      complaints,
      totalComplaints,
      totalInProgress,
      totalPending,
      totalResolved,
    };
  }
  catch (error) {
    if (error && typeof error === "object" && "statusCode" in error)
      throw error;

    handleError(error, "Get Complaint Data", event);
  }
});

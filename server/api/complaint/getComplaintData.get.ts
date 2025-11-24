import { complaintQueries } from "~~/server/db/queries";

export default defineEventHandler(async (event) => {
  const { adminData } = await adminSessionCheck(event);

  try {
    const {
      getComplaintStatusCount,
      getScopedComplaints,
    } = await complaintQueries();

    const complaints = getScopedComplaints(adminData);

    const {
      totalComplaints,
      totalInProgress,
      totalPending,
      totalResolved,
    } = await getComplaintStatusCount(adminData);

    return {
      complaints,
      totalComplaints,
      totalInProgress,
      totalPending,
      totalResolved,
    };
  }
  catch (error) {
    if (error && typeof error === "object" && "statusCode" in error) {
      throw error;
    }

    handleError(error, "Get Complaint Data", event);
  }
});

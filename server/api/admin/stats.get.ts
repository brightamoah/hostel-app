import { statsQueries } from "~~/server/db/queries/stats";

export default defineEventHandler(async (event) => {
  const { adminData } = await adminSessionCheck(event);

  try {
    const {
      getDashboardOverview,
      getCardStats,
    } = await statsQueries();
    const overview = await getDashboardOverview(adminData);
    const cardStats = await getCardStats(adminData.hostelId);

    return {
      overview,
      cardStats,
    };
  }
  catch (error) {
    if (error && typeof error === "object" && "statusCode" in error) throw error;

    handleError(error, "Admin Stats", event);
  }
});

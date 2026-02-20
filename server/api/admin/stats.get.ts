import { statsQueries } from "~~/server/db/queries/stats";

export default defineEventHandler(async (event) => {
  const { adminData } = await adminSessionCheck(event);

  try {
    const {
      getDashboardStats,
      getScopedDashboardStats,
      getCardStats,
    } = await statsQueries();

    const stats = await getDashboardStats(adminData);
    const scopedStats = await getScopedDashboardStats(adminData.hostelId);
    const cardStats = await getCardStats(adminData.hostelId);

    return {
      stats,
      scopedStats,
      cardStats,
    };
  }
  catch (error) {
    if (error && typeof error === "object" && "statusCode" in error) throw error;

    handleError(error, "Admin Stats", event);
  }
});

import { billingQueries } from "~~/server/db/queries";

export default defineEventHandler(async (event) => {
  const { adminData } = await adminSessionCheck(event);

  try {
    const {
      getScopedBillingsAdmin,
      getBillingStatusCount,
    } = await billingQueries();

    const {
      totalPaid,
      totalUnpaid,
      totalPending,
      totalOverdue,
      totalBillings,
    } = await getBillingStatusCount(adminData);

    const billings = await getScopedBillingsAdmin(adminData);

    return {
      billings,
      totalBillings,
      totalPaid,
      totalUnpaid,
      totalPending,
      totalOverdue,
    };
  }
  catch (error) {
    if (error && typeof error === "object" && "statusCode" in error) throw error;

    handleError(error, "Get Billing Data", event);
  }
});

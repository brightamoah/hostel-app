/* eslint-disable no-console */
import { sql } from "drizzle-orm";

export default defineTask({
  meta: {
    name: "cancelUnpaidAllocations",
    description: "Cancel pending allocations without 60% payment after 3 days",
  },
  async run({ context }) {
    const { db } = useDB({ context });

    console.log("Running task: Cancel unpaid allocations...");

    try {
      // Execute the function
      const result = await db.execute(sql`SELECT * FROM cancel_unpaid_allocations()`);

      // Safety check: Ensure result exists and is an array-like object before accessing index 0
      if (!result || result.length === 0) {
        console.warn("Task warning: cancel_unpaid_allocations returned no data.");
        return { result: "No data returned" };
      }

      const row = result[0];
      const cancelledCount = row?.cancelled_count ?? 0;

      console.log("Task completed: Cancel unpaid allocations - Success. Cancelled", cancelledCount, "allocation(s).");

      return { result: `Success. Cancelled ${cancelledCount} allocation(s).` };
    }
    catch (error) {
      if (error && typeof error === "object" && "statusCode" in error) throw error;
      handleError(error, "Cancel Unpaid Allocations");
      return { error: "Failed to run task" };
    }
  },
});

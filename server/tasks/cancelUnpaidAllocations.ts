/* eslint-disable no-console */
import { sql } from "drizzle-orm";

export default defineTask({
  meta: {
    name: "cancelUnpaidAllocations",
    description: "Cancel pending allocations without 60% payment after 3 days",
  },
  async run() {
    const { db } = useDB();

    console.log("Running task: Cancel unpaid allocations...");

    try {
      const result = await db.execute(sql`SELECT * FROM cancel_unpaid_allocations()`);
      const cancelledCount = result.rows[0]?.cancelled_count ?? 0;

      console.log("Task completed: Cancel unpaid allocations - Success. Cancelled", cancelledCount, "allocation(s).");

      return { result: `Success. Cancelled ${cancelledCount} allocation(s).` };
    }
    catch (error) {
      if (error && typeof error === "object" && "statusCode" in error) throw error;
      handleError(error, "Cancel Unpaid Allocations");
    }
  },
});

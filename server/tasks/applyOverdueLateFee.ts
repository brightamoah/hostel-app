/* eslint-disable no-console */
import { sql } from "drizzle-orm";

export default defineTask({
  meta: {
    name: "applyOverdueLateFee",
    description: "Apply 5% weekly late fee to overdue billings",
  },
  async run({ context }) {
    const { db } = useDB({ context });

    console.log("Running task: Apply weekly late fees...");

    try {
      const result = await db.execute(sql`SELECT * FROM apply_weekly_late_fees()`);

      // Safety Check
      if (!result || result.length === 0) {
        console.warn("Task warning: apply_weekly_late_fees returned no data.");
        return { result: "No data returned" };
      }

      const row = result[0];
      const updatedCount = row?.updated_count ?? 0;
      const totalFees = row?.total_late_fees ?? 0;

      console.log("Task completed: Apply weekly late fees - Success. Updated", updatedCount, "billing(s). Total late fees applied:", totalFees);

      return {
        result: `Success. Applied late fees to ${updatedCount} billing(s). Total: ${totalFees}`,
      };
    }
    catch (error) {
      if (error && typeof error === "object" && "statusCode" in error) throw error;
      handleError(error, "Apply Overdue Late Fees");
      return { error: "Failed to run task" };
    }
  },
});

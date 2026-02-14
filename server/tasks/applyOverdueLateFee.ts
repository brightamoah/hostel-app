/* eslint-disable no-console */
import { sql } from "drizzle-orm";

export default defineTask({
  meta: {
    name: "applyOverdueLateFee",
    description: "Apply 5% weekly late fee to overdue billings",
  },
  async run() {
    const { db } = useDB();

    console.log("Running task: Apply weekly late fees...");

    try {
      const result = await db.execute(sql`SELECT * FROM apply_weekly_late_fees()`);
      const updatedCount = result.rows[0]?.updated_count ?? 0;
      const totalFees = result.rows[0]?.total_late_fees ?? 0;

      console.log("Task completed: Apply weekly late fees - Success. Updated", updatedCount, "billing(s). Total late fees applied:", totalFees);

      return {
        result: `Success. Applied late fees to ${updatedCount} billing(s). Total: ${totalFees}`,
      };
    }
    catch (error) {
      if (error && typeof error === "object" && "statusCode" in error) throw error;
      handleError(error, "Apply Overdue Late Fees");
    }
  },
});

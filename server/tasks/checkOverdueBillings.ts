/* eslint-disable no-console */
import { and, inArray, sql } from "drizzle-orm";

import { billing } from "../db/schema";

export default defineTask({
  meta: {
    name: "checkOverdueBillings",
    description: "Mark unpaid and partially paid bills as overdue if past their due date",
  },
  async run({ context }) {
    const { db } = useDB({ context });

    console.log("Running task: Checking for overdue billings...");

    try {
      const result = await db
        .update(billing)
        .set({
          status: "overdue",
          updatedAt: new Date(),
        })
        .where(and(
          sql`DATE(${billing.dueDate}) < CURRENT_DATE`,
          inArray(billing.status, ["unpaid", "partially paid"]),
        ))
        .returning({ id: billing.id }); ;

      const count = result.length;

      console.log("Task completed: Check overdue billings - Success. Marked", count, "bill(s) as overdue.");

      return { result: `Success. Marked ${count} bill(s) as overdue.` };
    }
    catch (error) {
      if (error && typeof error === "object" && "statusCode" in error) throw error;

      handleError(error, "Check Overdue Billings");
    }
  },
});

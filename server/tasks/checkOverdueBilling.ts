import { and, inArray, sql } from "drizzle-orm";

import { billing } from "../db/schema";

export default defineTask({
  meta: {
    name: "checkOverdueBillings",
    description: "Mark unpaid and partially paid bills as overdue if past their due date",
  },
  async run() {
    const { db } = useDB();

    console.log("Running task: Checking for overdue billings...");

    try {
      const result = await db
        .update(billing)
        .set({
          status: "overdue",
          updatedAt: new Date(),
        })
        .where(and(
          sql`${billing.dueDate} < CURRENT_DATE`,
          inArray(billing.status, ["unpaid", "partially paid"]),
        ))
        .returning({ id: billing.id }); ;

      const count = result.length;
      return { result: `Success. Marked ${count} bill(s) as overdue.` };
    }
    catch (error) {
      if (error && typeof error === "object" && "statusCode" in error) throw error;

      handleError(error, "Check Overdue Billings");
    }
  },
});

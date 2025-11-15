import { eq } from "drizzle-orm";

import { visitorQueries } from "../db/queries";
import { visitor, visitorLogs } from "../db/schema";

export async function createVisitorLog(visitorId: number, action: VisitorLog["action"], admin: Admin) {
  const { db } = useDB();
  const { getVisitorById } = await visitorQueries();

  return await db.transaction(async (tx) => {
    const visitorRecord = await getVisitorById(visitorId, admin);

    if (!visitorRecord) {
      throw createError({
        statusCode: 404,
        message: "Visitor not found.",
      });
    }

    if (admin.accessLevel !== "super" && visitorRecord.hostelId !== admin.hostelId) {
      throw createError({
        statusCode: 403,
        message: "You do not have permission to modify visitors for this hostel.",
      });
    }

    const lastLog = visitorRecord.visitorLogs[0];
    const today = new Date().toISOString().split("T")[0];

    if (visitorRecord.visitDate !== today) {
      throw createError({
        statusCode: 400,
        message: `Action denied. This visit is scheduled for ${visitorRecord.visitDate}, not today.`,
      });
    }

    if (action === "check_in") {
      if (!["approved", "checked-out"].includes(visitorRecord.status)) {
        throw createError({
          statusCode: 400,
          message: `Cannot check in. Visitor status is currently '${visitorRecord.status}'.`,
        });
      }

      if (lastLog && lastLog.action === "check_in") {
        throw createError({
          statusCode: 409,
          message: "This visitor is already checked in.",
        });
      }

      await tx
        .update(visitor)
        .set({ status: "checked-in" })
        .where(eq(visitor.id, visitorId));
    }
    else {
      if (visitorRecord.status !== "checked-in") {
        throw createError({
          statusCode: 400,
          message: "This visitor is not currently checked in.",
        });
      }

      if (!lastLog || lastLog.action !== "check_in") {
        throw createError({
          statusCode: 409,
          message: "Cannot check out a visitor who is not checked in.",
        });
      }

      await tx
        .update(visitor)
        .set({ status: "checked-out" })
        .where(eq(visitor.id, visitorId));
    };

    const [newLog] = await tx
      .insert(visitorLogs)
      .values({
        visitorId,
        adminId: admin.id,
        action,
      })
      .returning();

    return newLog;
  });
}

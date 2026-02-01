import type { CalendarDate } from "@internationalized/date";

import { getLocalTimeZone, parseAbsolute, parseDate, toCalendarDate, today } from "@internationalized/date";
import { eq } from "drizzle-orm";

import { visitorQueries } from "../db/queries";
import { visitor } from "../db/schema";

export async function updateVisitorStatus(visitorId: number, status: "approved" | "denied", admin: Admin) {
  const { db } = useDB();
  const { getVisitorById } = await visitorQueries();

  const visitorToUpdate = await getVisitorById(visitorId, admin);

  if (!visitorToUpdate) {
    throw createError({
      statusCode: 404,
      message: "Visitor not found or you do not have permission to access it.",
    });
  }

  if (visitorToUpdate.status !== "pending") {
    throw createError({
      statusCode: 400,
      message: `This visit cannot be modified as it is already '${visitorToUpdate.status}'`,
    });
  }

  const timezone = getLocalTimeZone();
  const currentDay = today(timezone);

  let visitDate: CalendarDate;

  try {
    const visitDateStr = typeof visitorToUpdate.visitDate === "string" ? visitorToUpdate.visitDate : "";
    visitDate = parseDate(visitDateStr.split("T")[0] || "");
  }
  catch {
    visitDate = toCalendarDate(parseAbsolute(new Date(String(visitorToUpdate.visitDate)).toISOString(), timezone));
  }

  if (visitDate.compare(currentDay) < 0) {
    throw createError({
      statusCode: 400,
      message: `This visit cannot be modified as the visit date has already passed.`,
    });
  }

  const [updatedVisitor] = await db
    .update(visitor)
    .set({ status, adminId: admin.id })
    .where(eq(visitor.id, visitorId))
    .returning();

  if (!updatedVisitor) {
    throw createError({
      statusCode: 500,
      message: "Failed to update visitor status.",
    });
  }

  return updatedVisitor;
}

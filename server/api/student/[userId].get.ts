import type { RoomInHostel } from "~~/shared/types";

import { roomQueries, userQueries } from "~~/server/db/queries";

export default defineEventHandler(async (event) => {
  await requireUserSession(event, {
    message: "Unauthorized Access: Please log in to continue.",
  });

  try {
    const { getStudentForDashboardByUserId } = await userQueries();
    const { getRoomsInHostel } = await roomQueries();

    const userId = Number(getRouterParam(event, "userId"));

    if (!userId || Number.isNaN(Number(userId))) {
      throw createError({
        statusCode: 400,
        statusMessage: "Invalid User ID: Please provide a valid user identifier.",
      });
    }

    const student = await getStudentForDashboardByUserId(userId);

    if (!student) {
      throw createError({
        statusCode: 404,
        statusMessage: "Student Not Found: Unable to retrieve student data.",
      });
    }

    const hostelId = student.studentRecord.allocation?.room?.hostelId;

    let rooms: RoomInHostel[] = [];

    if (hostelId) {
      rooms = await getRoomsInHostel(hostelId);
    }

    return {
      student: student.studentRecord,
      totalBilled: student.totalBilled,
      totalPaid: student.totalPaid,
      balance: student.outstandingBalance,
      totalVisitors: student.totalVisitors,
      pendingMaintenance: student.pendingMaintenanceCount,
      rooms,
    };
  }
  catch (error) {
    if (error && typeof error === "object" && "statusCode" in error) throw error;

    handleError(error, "Get Student Dashboard Data", event);
  }
});

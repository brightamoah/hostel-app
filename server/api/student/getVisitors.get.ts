import { userQueries, visitorQueries } from "~~/server/db/queries";

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event, {
    message: "Unauthorized Access: Please log in to continue.",
  });

  try {
    const userId = user.id;

    const { getVisitorsForStudent, getVisitorStatusCountForStudent } = await visitorQueries();
    const { getStudentByUserId } = await userQueries();

    const student = await getStudentByUserId(userId);

    if (!student) {
      throw createError({
        statusCode: 404,
        message: "Student Not Found: Unable to retrieve student data.",
      });
    }

    const [
      visitors,
      {
        approved,
        checkedIn,
        pending,
        totalVisitors,
      },
    ] = await Promise.all([
      getVisitorsForStudent(student.id),
      getVisitorStatusCountForStudent(student.id),
    ]);

    return {
      visitors,
      approved,
      checkedIn,
      pending,
      totalVisitors,
    };
  }
  catch (error) {
    if (error && typeof error === "object" && "statusCode" in error) throw error;

    return handleError(error, "Get Student Visitors", event);
  }
});

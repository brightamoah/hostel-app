import { userQueries } from "~~/server/db/queries";

export default defineEventHandler(async (event) => {
  await requireUserSession(event, {
    message: "Unauthorized Access: Please log in to continue.",
  });

  try {
    const body = await readValidatedBody(event, body => bookRoomSchema.safeParse(body));

    if (!body.success) {
      throw createError({
        statusCode: 400,
        message: `Invalid request: ${body.error.issues
          .map(i => i.message)
          .join(", ")}`,
      });
    }

    const { getStudentByUserId } = await userQueries();

    const { roomId, userId, endDate } = body.data;

    const student = await getStudentByUserId(userId);

    if (!student) {
      throw createError({
        statusCode: 404,
        message: "Student profile not found. Cannot book room.",
      });
    }

    const studentId = student.id;

    const allocation = await bookRoom(studentId, roomId, endDate);

    return {
      success: true,
      message: "Room booked successfully. An invoice has been generated.",
      allocation,
    };
  }
  catch (error) {
    if (error && typeof error === "object" && "statusCode" in error) throw error;

    handleError(error, "Book Student Room", event);
  }
});

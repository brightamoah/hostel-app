import { announcementQueries, userQueries } from "~~/server/db/queries";

export default defineEventHandler(async (event) => {
  const { userId } = await studentSessionCheck(event);

  try {
    const { getAllAnnouncementForStudent } = await announcementQueries();
    const { getStudentWithRelations } = await userQueries();

    const studentMakingRequest = await getStudentWithRelations(userId);

    if (!studentMakingRequest) {
      throw createError({
        statusCode: 403,
        message: "Account for the student making the request not found or is inactive.",
      });
    }

    const hostelId = studentMakingRequest?.allocation?.room?.hostel?.id;
    const roomId = studentMakingRequest?.allocation?.room?.id;

    const announcements = await getAllAnnouncementForStudent(
      userId,
      hostelId,
      roomId,
    );

    return {
      announcements,
    };
  }
  catch (error) {
    if (error && typeof error === "object" && "statusCode" in error) throw error;

    handleError(error, "Get Student Announcement Data", event);
  }
});

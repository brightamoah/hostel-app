import { announcementQueries, userQueries } from "~~/server/db/queries";

export default defineEventHandler(async (event) => {
  const { userId } = await adminSessionCheck(event);

  try {
    const { getAdminByUserId } = await userQueries();
    const { getAllAnnouncementsForAdmin } = await announcementQueries();

    const adminMakingRequest = await getAdminByUserId(
      userId,
      true,
    );

    if (!adminMakingRequest) {
      throw createError({
        statusCode: 403,
        message: "Account for the admin making the request not found or is inactive.",
      });
    }

    const announcements = await getAllAnnouncementsForAdmin(adminMakingRequest);

    return {
      announcements,
    };
  }
  catch (error) {
    if (error && typeof error === "object" && "statusCode" in error) {
      throw error;
    }

    handleError(error, "Get Announcement Data", event);
  }
});

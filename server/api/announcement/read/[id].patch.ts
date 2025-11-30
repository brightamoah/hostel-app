import { announcementQueries } from "~~/server/db/queries";

export default defineEventHandler(async (event) => {
  await requireUserSession(event, {
    message: "Unauthorized Access: Please log in to continue.",
  });

  try {
    const id = Number(getRouterParams(event).id);

    if (!id || Number.isNaN(id)) {
      throw createError({
        statusCode: 400,
        message: "Missing or invalid announcement ID.",
      });
    }

    const { markAnnouncementAsRead } = await announcementQueries();

    const [updatedAnnouncement] = await markAnnouncementAsRead(id);

    if (!updatedAnnouncement) {
      throw createError({
        statusCode: 500,
        message: "Failed to mark announcement as read.",
      });
    }

    return {
      success: true,
      message: "Announcement marked as read successfully.",
      id,
    };
  }
  catch (error) {
    if (error && typeof error === "object" && "statusCode" in error) {
      throw error;
    }

    handleError(error, "Mark Announcement as Read", event);
  }
});

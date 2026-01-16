import { announcementQueries } from "~~/server/db/queries";

export default defineEventHandler(async (event) => {
  const { adminData, userId } = await adminSessionCheck(event);

  try {
    const idFromParams = Number(getRouterParams(event).id);

    const body = await readValidatedBody(event, body => editAnnouncementSchema.safeParse(body));

    if (!body.success) {
      throw createError({
        statusCode: 400,
        message: `${body.error.issues
          .map(i => i.message)
          .join(", ")}`,
      });
    }

    const { announcementId, data, resetReadStatus } = body.data;

    if (announcementId !== idFromParams) {
      throw createError({
        statusCode: 400,
        message: "Announcement ID in the URL does not match the ID in the request body.",
      });
    }

    if (data.content) {
      data.content = sanitizeHtmlContent(data.content);
    }

    const { editAnnouncement, getAnnouncementById } = await announcementQueries();

    const updatedAnnouncement = await editAnnouncement(
      announcementId,
      adminData,
      data,
      resetReadStatus,
    );

    if (!updatedAnnouncement) {
      const existingAnnouncement = await getAnnouncementById(announcementId, userId);

      if (!existingAnnouncement) {
        throw createError({
          statusCode: 404,
          message: "Announcement not found.",
        });
      }

      throw createError({
        statusCode: 403,
        message: "You are not authorized to edit this announcement.",
      });
    }

    return {
      success: true,
      message: "Announcement updated successfully.",
      data: updatedAnnouncement,
    };
  }
  catch (error) {
    if (error && typeof error === "object" && "statusCode" in error) throw error;

    handleError(error, "Edit Announcement", event);
  }
});

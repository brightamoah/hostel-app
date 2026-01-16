import { announcementQueries } from "~~/server/db/queries";

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event, {
    message: "Unauthorized Access: Please log in to continue.",
  });

  try {
    const id = Number(getRouterParams(event).id);

    if (!id || Number.isNaN(id)) {
      throw createError({
        statusCode: 400,
        message: "Invalid announcement ID.",
      });
    }

    const body = await readValidatedBody(event, body => readStatusSchema.safeParse(body));

    if (!body.success) {
      throw createError({
        statusCode: 400,
        message: `${body.error.issues
          .map(i => i.message)
          .join(", ")}`,
      });
    }

    const { action } = body.data;

    const { updateAnnouncementReadStatus } = await announcementQueries();

    await updateAnnouncementReadStatus(
      id,
      user.id,
      action === "read",
    );

    return {
      success: true,
      message: `Announcement marked as ${action} successfully.`,
      id,
    };
  }
  catch (error) {
    if (error && typeof error === "object" && "statusCode" in error) throw error;

    handleError(error, "Update Announcement Read Status", event);
  }
});

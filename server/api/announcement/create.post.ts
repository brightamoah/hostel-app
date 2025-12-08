import { announcementQueries } from "~~/server/db/queries";
import sanitizeHtml from "sanitize-html";

export default defineEventHandler(async (event) => {
  const { adminData } = await adminSessionCheck(event);

  try {
    const body = await readValidatedBody(event, body => createAnnouncementSchema.safeParse(body));

    if (!body.success) {
      throw createError({
        statusCode: 400,
        message: `${body.error.issues
          .map(i => i.message)
          .join(", ")}`,
      });
    }

    const { createAnnouncement } = await announcementQueries();

    const { content, priority, targetAudience, title, targetHostelId, targetRoomId, targetUserId } = body.data;

    const cleanContent = sanitizeHtml(content, {
      allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img"]),
      allowedAttributes: {
        ...sanitizeHtml.defaults.allowedAttributes,
        "img": ["src", "srcset", "alt", "title", "width", "height", "loading"],
        "*": ["style", "class"],
      },
    });

    if (priority === "" || targetAudience === "") {
      throw createError({
        statusCode: 400,
        message: "Priority and Target Audience cannot be empty.",
      });
    }

    const newAnnouncement = await createAnnouncement({
      content: cleanContent,
      priority,
      targetAudience,
      title,
      targetHostelId,
      targetRoomId,
      targetUserId,
      postedBy: adminData.id,
    });

    return {
      success: true,
      message: "Announcement created successfully. Your announcement has been posted and will be visible to the target audience shortly.",
      data: newAnnouncement,
    };
  }
  catch (error) {
    if (error && typeof error === "object" && "statusCode" in error) throw error;

    handleError(error, "Create New Announcement", event);
  }
});

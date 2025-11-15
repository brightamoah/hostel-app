import { visitorQueries } from "~~/server/db/queries";

export default defineEventHandler(async (event) => {
  await checkAdminSession(event);

  try {
    const body = await readValidatedBody(event, body => deleteItemSchema.safeParse(body));

    if (!body.success) {
      throw createError({
        statusCode: 400,
        message: `${body.error.issues
          .map(i => i.message)
          .join(", ")}`,
      });
    }

    const { ids } = body.data;

    const { getVisitorByIds } = await visitorQueries();

    const visitorsToDelete = await getVisitorByIds(ids);

    return {
      message: `Successfully deleted ${visitorsToDelete.length} visitors.`,
      visitorsToDelete,
    };
  }
  catch (error) {
    if (error && typeof error === "object" && "statusCode" in error) {
      throw error;
    }

    handleError(error, "Delete Visitor Admin", event);
  }
});

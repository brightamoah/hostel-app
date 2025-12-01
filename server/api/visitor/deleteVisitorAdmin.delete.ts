import { visitorQueries } from "~~/server/db/queries";

export default defineEventHandler(async (event) => {
  const { adminData } = await adminSessionCheck(event);

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

    const { getVisitorByIds, deleteVisitorsByIds } = await visitorQueries();

    const visitorsToDelete = await getVisitorByIds(ids);

    if (visitorsToDelete.length !== ids.length) {
      const foundIds = visitorsToDelete.map(v => v.id);
      const missingIds = ids.filter(id => !foundIds.includes(id));

      const message = missingIds.length > 1
        ? `Visitors with IDs ${missingIds.join(", ")} not found`
        : `Visitor with ID ${missingIds[0]} not found`;

      throw createError({
        statusCode: 404,
        message,
      });
    }

    if (adminData.accessLevel !== "super") {
      const adminHostelId = adminData.hostelId;
      const unauthorizedVisitors = visitorsToDelete.filter(v => v.hostelId !== adminHostelId);

      if (unauthorizedVisitors.length > 0) {
        throw createError({
          statusCode: 403,
          message: "Access Denied: You do not have permission to delete visitors from other hostels.",
        });
      }
    }

    const nonDeletableVisitors = visitorsToDelete.filter(visitor => visitor.status !== "pending" && visitor.status !== "cancelled");

    if (nonDeletableVisitors.length > 0) {
      const details = nonDeletableVisitors.map(v => `${v.name} (Status: ${v.status})`).join("; ");

      const message = nonDeletableVisitors.length > 1
        ? `Action denied: Some visitors cannot be deleted due to their status: ${details}`
        : `Action denied: Visitor "${nonDeletableVisitors[0].name}" cannot be deleted due to its status: ${nonDeletableVisitors[0].status}`;

      throw createError({
        statusCode: 400,
        message,
      });
    }

    const deletedVisitors = await deleteVisitorsByIds(ids);

    const message = deletedVisitors.length > 1
      ? `Successfully deleted ${deletedVisitors.length} visitors.`
      : `Successfully deleted 1 visitor.`;

    return {
      success: true,
      message,
    };
  }
  catch (error) {
    if (error && typeof error === "object" && "statusCode" in error)
      throw error;

    handleError(error, "Delete Visitor Admin", event);
  }
});

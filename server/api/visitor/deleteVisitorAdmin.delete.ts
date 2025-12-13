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
      const foundIds = new Set(visitorsToDelete.map(v => v.id));

      const missingIds = ids.filter(id => !foundIds.has(id));

      const message = missingIds.length > 1
        ? `Visitors with IDs ${missingIds.join(", ")} not found`
        : `Visitor with ID ${missingIds[0]} not found`;

      throw createError({
        statusCode: 404,
        message,
      });
    }

    if (adminData.accessLevel !== "super") {
      const unauthorizedVisitors = visitorsToDelete.filter(v => v.hostelId !== adminData.hostelId);

      if (unauthorizedVisitors.length > 0) {
        throw createError({
          statusCode: 403,
          message: "Access Denied: You do not have permission to delete visitors from other hostels.",
        });
      }
    }

    const nonDeletableVisitors = visitorsToDelete.filter(visitor => !["pending", "cancelled"].includes(visitor.status));

    if (nonDeletableVisitors.length > 0) {
      const firstItem = nonDeletableVisitors[0];

      if (!firstItem) throw new Error("Unexpected error processing visitors");

      let message = "";

      if (nonDeletableVisitors.length > 1) {
        const details = nonDeletableVisitors
          .map(v => `${v.name} (${v.status})`)
          .join("; ");
        message = `Action denied: Some visitors cannot be deleted due to their status: ${details}`;
      }
      else {
        message = `Action denied: Visitor "${firstItem.name}" cannot be deleted due to its status: ${firstItem.status}`;
      }

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
    if (error && typeof error === "object" && "statusCode" in error) throw error;

    handleError(error, "Delete Visitor Admin", event);
  }
});

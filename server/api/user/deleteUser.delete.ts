import { userQueries } from "~~/server/db/queries/user";

import { deleteItemSchema } from "~/utils/schema";

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event);

  if (
    !session?.user
    || session.user.role !== "admin"
    || session.user.adminData?.accessLevel !== "super"
  ) {
    throw createError({
      statusCode: 403,
      message: "Access denied: Only super admins can delete users",
    });
  }

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

    const uniqueIds = [...new Set(ids)].filter((id): id is number => Number.isInteger(id) && id > 0);

    if (uniqueIds.length === 0) {
      throw createError({
        statusCode: 400,
        message: "No valid user IDs provided.",
      });
    }

    if (uniqueIds.includes(session.user.id)) {
      throw createError({
        statusCode: 400,
        message: "You cannot delete your own account.",
      });
    }

    const { getUserByIds, deleteUsersByIds } = await userQueries(event);

    const usersToDelete = await getUserByIds(uniqueIds);

    if ((usersToDelete).length !== uniqueIds.length) {
      const foundIds = (usersToDelete).map(u => u.id);
      const notFoundIds = uniqueIds.filter(id => !foundIds.includes(id));
      throw createError({
        statusCode: 404,
        message: `One or more users not found. Could not find users with IDs: ${notFoundIds.join(", ")}.`,
      });
    }

    const superAdminTargets = usersToDelete
      .filter(u => u.role === "admin" && u.admin?.accessLevel === "super")
      .map(u => u.id);

    if (superAdminTargets.length > 0) {
      throw createError({
        statusCode: 403,
        message: `Deletion blocked: cannot delete super admin(s) with IDs: ${superAdminTargets.join(", ")}.`,
      });
    }

    const activeStudentTargets = usersToDelete
      .filter(u => u.role === "student" && u.student?.allocation?.status === "active")
      .map(u => u.id);

    if (activeStudentTargets.length > 0) {
      throw createError({
        statusCode: 409,
        message: `Deletion blocked: student(s) with active allocations: ${activeStudentTargets.join(", ")}.`,
      });
    }

    const deletedUsers = await deleteUsersByIds(ids);

    return {
      deletedUsers,
      message: `Successfully deleted ${deletedUsers.length} user(s).`,
    };
  }
  catch (error) {
    if (error && typeof error === "object" && "statusCode" in error) {
      throw error;
    }

    handleError(error, "Delete User Data", event);
  }
});

import { userQueries } from "~~/server/db/queries/user";

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event);

  if (!session || !session.user || session.user.role !== "admin" || !session.user.adminData || session.user.adminData.status !== "active") {
    throw createError({
      statusCode: 403,
      message: "Access denied: Must be a verified active admin",
    });
  }

  try {
    const { getUsersScoped } = await userQueries(event);
    const data = await getUsersScoped(session.user.id);

    const {
      users,
      totalUsers,
      totalStudents,
      totalAdmins,
      activeStudents,
    } = data;

    return {
      users,
      totalUsers,
      totalStudents,
      totalAdmins,
      activeStudents,
      message: `Fetched user data for ${data.adminRecord.accessLevel} admin`,
    };
  }
  catch (error) {
    if (error && typeof error === "object" && "statusCode" in error) {
      throw error;
    }

    handleError(error, "Get User Data", event);
  }
});

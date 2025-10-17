import { userQueries } from "~~/server/db/queries/user";

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event);

  if (!session || !session.user || session.user.role !== "admin") {
    throw createError({
      statusCode: 403,
      message: "Access denied: Must be a verified admin",
    });
  }

  try {
    const { getAllUsers, getTotalAdmins, getTotalStudents, getActiveStudentsCount } = await userQueries(event);

    const allUsers = await getAllUsers();

    if (!allUsers)
      throw createError({ statusCode: 404, message: "No users found" });

    const totalUsers: number = allUsers.length;

    const totalStudents: number = await getTotalStudents();

    const totalAdmins: number = await getTotalAdmins();

    const activeStudents: number = await getActiveStudentsCount();

    return {
      users: allUsers,
      totalUsers,
      totalStudents,
      totalAdmins,
      activeStudents,
    };
  }
  catch (error) {
    if (error && typeof error === "object" && "statusCode" in error) {
      throw error;
    }

    handleError(error, "Get User Data", event);
  }
});

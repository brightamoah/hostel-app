import { userQueries } from "~~/server/db/queries/user";

export default defineEventHandler(async (event) => {
  const { adminData } = await adminSessionCheck(event);

  try {
    const { getUsers } = await userQueries();

    const data = await getUsers(adminData);

    const {
      users,
      totalUsers,
      totalStudents,
      totalAdmins,
      activeStudents,
    } = data;

    const flattenUsers = users.map((u) => {
      const hostelName
        = u.student?.allocation?.room?.hostel?.name
          || u.admin?.hostel?.name
          || "N/A";

      const { emailVerified, ...rest } = u;

      return {
        ...rest,
        hostelName,
        isEmailVerified: emailVerified,
        emailVerified,
      };
    });

    return {
      users: flattenUsers,
      totalUsers,
      totalStudents,
      totalAdmins,
      activeStudents,
      message: `Fetched user data for ${adminData.accessLevel} admin`,
    };
  }
  catch (error) {
    if (error && typeof error === "object" && "statusCode" in error) throw error;

    handleError(error, "Get User Data", event);
  }
});

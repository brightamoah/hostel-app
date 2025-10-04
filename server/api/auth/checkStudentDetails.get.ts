import { userQueries } from "~~/server/db/queries/user";
// import { student } from "~~/server/db/schema";
// import { eq } from "drizzle-orm";

export default defineEventHandler(async (event) => {
  try {
    const session = await getUserSession(event);
    const { getOnboardedStudent } = await userQueries(event);

    if (!session.user || session.user.role !== "student") {
      throw createError({ statusCode: 403, message: "Forbidden" });
    }

    // const { db } = useDB();
    const existingStudent = await getOnboardedStudent(session.user.id);

    return {
      exists: !!existingStudent,
      // student: existingStudent || null,
    };
  }
  catch (error) {
    handleAuthError(error);
  }
});

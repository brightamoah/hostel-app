import { userQueries } from "~~/server/db/queries/user";

export default defineEventHandler(async (event) => {
  try {
    const session = await getUserSession(event);
    const { getOnboardedStudent } = await userQueries(event);

    if (!session.user || !session.user.emailVerified || session.user.role !== "student") {
      return {
        exists: false,
        student: null,
      };
    }

    const existingStudent = await getOnboardedStudent(session.user.id);

    return {
      exists: !!existingStudent,
      student: existingStudent || null,
    };
  }
  catch (error) {
    handleAuthError(error);
  }
});

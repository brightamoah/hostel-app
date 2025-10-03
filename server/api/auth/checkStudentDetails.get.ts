import { student } from "~~/server/db/schema";
import { eq } from "drizzle-orm";

export default defineEventHandler(async (event) => {
  try {
    const session = await getUserSession(event);

    if (!session.user || session.user.role !== "student") {
      throw createError({ statusCode: 403, message: "Forbidden" });
    }

    const { db } = useDB();
    const existingStudent = await db.query.student.findFirst({
      where: eq(student.userId, session.user.id),
    });

    return { exists: !!existingStudent };
  }
  catch (error) {
    handleAuthError(error);
  }
});

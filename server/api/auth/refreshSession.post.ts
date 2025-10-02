import type { UserSession } from "#auth-utils";

import { user } from "~~/server/db/schema";
import { handleAuthError } from "~~/server/utils/authErrorHandler";
import { useDB } from "~~/server/utils/db";
import { eq } from "drizzle-orm";

export default defineEventHandler(async (event) => {
  try {
    const { db } = useDB();

    const session = await getUserSession(event) as UserSession;

    if (!session.user?.id) {
      throw createError({ statusCode: 401, statusMessage: "User not authenticated" });
    }

    const freshUser = await db.query.user.findFirst({
      where: eq(user.id, session.user.id),
    });

    if (!freshUser) {
      throw createError({ statusCode: 404, message: "User not found" });
    }

    await setUserSession(event, {
      user: {
        id: freshUser.id,
        email: freshUser.email,
        role: freshUser.role,
        image: freshUser.image,
        name: freshUser.name,
        emailVerified: freshUser.emailVerified,
        updatedAt: freshUser.updatedAt,
        lastLogin: freshUser.lastLogin,
      },
      loggedInAt: session.loggedInAt,
    });

    return { success: true, message: "Session refreshed" };
  }
  catch (error) {
    handleAuthError(error);
  }
});

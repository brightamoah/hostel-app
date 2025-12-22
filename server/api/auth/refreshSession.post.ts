import { userQueries } from "~~/server/db/queries";
import { handleError } from "~~/server/utils/errorHandler";

export default defineEventHandler(async (event) => {
  try {
    const { user, expiresAt, onboarded } = await requireUserSession(event, {
      message: "User not authenticated",
    });

    const userId = user.id;

    const { getUserById } = await userQueries();

    const freshUser = await getUserById(userId);

    if (!freshUser) throw createError({ statusCode: 404, message: "User not found" });

    await setUserSession(event, {
      user: {
        id: freshUser.id,
        email: freshUser.email,
        role: freshUser.role,
        image: freshUser.image,
        name: freshUser.name,
        emailVerified: freshUser.emailVerified,
        createdAt: freshUser.createdAt,
        updatedAt: freshUser.updatedAt,
        lastLogin: freshUser.lastLogin,
      },
      loggedInAt: freshUser.lastLogin,
      expiresAt,
      onboarded,
    });

    return { success: true, message: "Session refreshed" };
  }
  catch (error) {
    if (error && typeof error === "object" && "statusCode" in error) throw error;

    handleError(error, "Refresh Session", event);
  }
});

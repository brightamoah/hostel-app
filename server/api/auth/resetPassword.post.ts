import { userQueries } from "~~/server/db/queries/user";
import { user } from "~~/server/db/schema";
import { eq } from "drizzle-orm";

import { passwordResetSchema } from "~/utils/schema";

export default defineEventHandler(async (event) => {
  try {
    const { db } = useDB();
    const { getUserByEmail } = await userQueries(event);

    const body = await readValidatedBody(event, body => passwordResetSchema.safeParse(body));

    if (!body.success) {
      throw createError({
        statusCode: 400,
        message: `Invalid email: ${body.error.issues}`,
      });
    }

    const { token, newPassword, email } = body.data;

    if (!token || !newPassword || !email) {
      throw createError({
        statusCode: 400,
        message: "Email, token and new password required",
      });
    }

    const existingUser = await getUserByEmail(email);

    if (!existingUser || !existingUser.resetTokenExpiresAt || existingUser.resetTokenExpiresAt < new Date()) {
      throw createError({
        statusCode: 400,
        message: "Invalid or expired token",
      });
    }

    const isTokenValid = await verifyHashedValue(existingUser.resetToken!, token);

    if (!isTokenValid) {
      throw createError({
        statusCode: 400,
        message: "Invalid or expired token - please request a new one",
      });
    }

    const newHashedPassword = await hashPassword(newPassword);

    await db.update(user).set({
      password: newHashedPassword,
      resetToken: null,
      resetTokenExpiresAt: null,
    }).where(eq(user.id, existingUser.id));

    return {
      success: true,
      message: "Password has been reset successfully.",
    };
  }
  catch (error) {
    handleAuthError(error);
  }
});

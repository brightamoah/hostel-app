import { userQueries } from "~~/server/db/queries/user";
import { user } from "~~/server/db/schema";
import { handleError } from "~~/server/utils/errorHandler";
import { eq } from "drizzle-orm";

import { passwordResetSchema } from "~/utils/schema";

export default defineEventHandler(async (event) => {
  try {
    const { db } = useDB();
    const { getUserById } = await userQueries(event);

    const body = await readValidatedBody(event, body => passwordResetSchema.safeParse(body));

    if (!body.success) {
      throw createError({
        statusCode: 400,
        message: `Invalid request: ${body.error.issues
          .map(i => i.message)
          .join(", ")}`,
      });
    }

    const { token, newPassword, id } = body.data;

    if (!token || !newPassword || !id) {
      throw createError({
        statusCode: 400,
        message: "ID, token and new password required",
      });
    }

    const existingUser = await getUserById(id);

    if (
      !existingUser
      || !existingUser.resetToken
      || !existingUser.resetTokenExpiresAt
    ) {
      throw createError({
        statusCode: 400,
        message: "Invalid password reset token",
      });
    }

    const now = new Date();
    if (existingUser.resetTokenExpiresAt < now) {
      await db.update(user).set({
        resetToken: null,
        resetTokenExpiresAt: null,
      }).where(eq(user.id, existingUser.id));

      throw createError({
        statusCode: 410,
        message: "Password reset token has expired. Please request a new one.",
      });
    }

    const isTokenValid = await verifyHashedValue(existingUser.resetToken!, token);

    if (!isTokenValid) {
      throw createError({
        statusCode: 400,
        message: "Invalid or expired token reset token",
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
    handleError(error, "Reset Password", event);
  }
});

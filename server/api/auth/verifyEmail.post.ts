import { userQueries } from "~~/server/db/queries/user";
import { user } from "~~/server/db/schema";
import { handleAuthError } from "~~/server/utils/authErrorHandler";
import { useDB } from "~~/server/utils/db";
import { eq } from "drizzle-orm";

import { emailVerificationSchema } from "~/utils/schema";

export default defineEventHandler(async (event) => {
  try {
    const { db } = useDB();
    const { getUserById } = await userQueries(event);

    const body = await readValidatedBody(event, body =>
      emailVerificationSchema.safeParse(body));

    if (!body.success) {
      throw createError({
        statusCode: 400,
        message: `Invalid request: ${body.error.issues
          .map(i => i.message)
          .join(", ")}`,
      });
    }

    const { token, id } = body.data;

    if (!token || !id) {
      throw createError({
        statusCode: 400,
        message: "Valid token and id required",
      });
    }

    const userToVerify = await getUserById(id);

    if (
      !userToVerify
      || !userToVerify.verificationToken
      || !userToVerify.verificationTokenExpiresAt
    ) {
      throw createError({
        statusCode: 400,
        message: "Invalid verification request token",
      });
    }

    const now = new Date();
    if (userToVerify.verificationTokenExpiresAt < now) {
      // Clean up expired token
      await db.update(user).set({
        verificationToken: null,
        verificationTokenExpiresAt: null,
      }).where(eq(user.id, userToVerify.id));

      throw createError({
        statusCode: 410,
        message: "Verification token has expired. Please request a new verification email.",
      });
    }

    const isTokenValid = await verifyHashedValue(
      userToVerify.verificationToken!,
      token,
    );

    if (!isTokenValid) {
      throw createError({
        statusCode: 400,
        message: "Invalid or expired verification token",
      });
    }

    await db.update(user).set({
      emailVerified: true,
      verificationToken: null,
      verificationTokenExpiresAt: null,
    }).where(eq(user.id, userToVerify.id));

    return {
      success: true,
      statusCode: 200,
      message: "Your email has been successfully verified. You can now log in.",
    };
  }
  catch (error) {
    handleAuthError(error);
  }
});

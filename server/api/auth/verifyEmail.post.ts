import { user } from "~~/server/db/schema";
import { eq } from "drizzle-orm";

import type { VerificationToken } from "~/types";

export default defineEventHandler(async (event) => {
  const { db } = useDB();

  const body = await readBody(event);
  const { token } = body as { token?: VerificationToken };

  if (!token) {
    throw createError({ statusCode: 400, message: "Valid token required" });
  }

  const userToVerify = await db.query.user.findFirst({
    where: eq(user.verificationToken, token),
  });

  if (!userToVerify) {
    throw createError({ statusCode: 404, message: "Invalid or expired verification token" });
  }

  const now = new Date();
  if (userToVerify.verificationTokenExpiresAt && now > userToVerify.verificationTokenExpiresAt) {
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

  await db.update(user).set({
    emailVerified: true,
    verificationToken: null,
  }).where(eq(user.id, userToVerify.id));

  return { message: "Email verified successfully" };
});

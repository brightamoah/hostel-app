import { useDB } from "~~/server/utils/db";
import { and, eq, isNotNull, lt } from "drizzle-orm";

import { user } from "../schema";

export const userQueries = defineEventHandler(async () => {
  const { db } = useDB();

  async function updateUserLastLogin(userId: number) {
    await db.update(user).set({
      lastLogin: new Date(),
    }).where(eq(user.id, userId));
  }

  async function cleanupExpiredVerificationTokens() {
    const now = new Date();

    const result = await db.update(user)
      .set({
        verificationToken: null,
        verificationTokenExpiresAt: null,
      })
      .where(
        and(
          isNotNull(user.verificationToken),
          lt(user.verificationTokenExpiresAt, now),
        ),
      );

    return result;
  }

  const getUserByEmail = async (email: string) => {
    const existingUser = await db.query.user.findFirst({
      where: eq(user.email, email),
    });
    return existingUser;
  };

  return { updateUserLastLogin, cleanupExpiredVerificationTokens, getUserByEmail };
});

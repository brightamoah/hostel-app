import { user } from "~~/server/db/schema";
import { eq } from "drizzle-orm";

import { db } from "~/db";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { token } = body;

  if (!token) {
    throw createError({ statusCode: 400, message: "Token required" });
  }

  const userToVerify = await db.query.user.findFirst({
    where: eq(user.verificationToken, token),
  });

  if (!userToVerify) {
    throw createError({ statusCode: 404, message: "Invalid token" });
  }

  await db.update(user).set({
    emailVerified: true,
    verificationToken: null,
  }).where(eq(user.id, userToVerify.id));

  return sendRedirect(event, "/auth/login");
});

import { user } from "~~/server/db/schema";
import { eq } from "drizzle-orm";

import type { User } from "~/types";

import { db } from "~/db";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  const { email, password } = body;

  if (!email || !password) {
    throw createError({ statusCode: 400, message: "Email and password required" });
  }

  const currentUser = await db.query.user.findFirst({ where: eq(user.email, email) });
  if (!currentUser) {
    throw createError({ statusCode: 401, message: "Invalid credentials" });
  }

  const isValid = await verifyPassword(currentUser!.password, password);
  if (!isValid) {
    throw createError({ statusCode: 401, message: "Invalid credentials" });
  }

  if (!currentUser.emailVerified) {
    throw createError({ statusCode: 403, message: "Email not verified" });
  }

  await setUserSession(event, {
    user: {
      id: currentUser!.id,
      email: currentUser!.email,
      role: currentUser!.role,
      image: currentUser!.image,
      name: currentUser!.name,
      emailVerified: currentUser!.emailVerified,
      updatedAt: currentUser!.updatedAt,
      lastLogin: currentUser!.lastLogin,
    } as User,
    loggedInAt: Date.now(),
  });

  const userDashboardRoute = currentUser.role === "admin" ? "/admin/dashboard" : "/student/dashboard";

  return sendRedirect(event, userDashboardRoute);
});

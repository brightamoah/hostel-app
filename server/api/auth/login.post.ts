import type { User } from "#auth-utils";

import { userQueries } from "~~/server/db/queries/user";
import { handleAuthError } from "~~/server/utils/authErrorHandler";

import { loginSchema } from "~/utils/schema";

export default defineEventHandler(async (event) => {
  try {
    const { session, nodeEnv } = useRuntimeConfig();

    const { updateUserLastLogin, getOnboardedStudent, getUserByEmail } = await userQueries(event);

    const body = await readValidatedBody(event, body => loginSchema.safeParse(body));

    if (!body.success)
      throw body.error.issues;

    const { email, password, rememberMe } = body.data;

    if (!email || !password) {
      throw createError({ statusCode: 400, message: "Email and password required" });
    }

    const currentUser = await getUserByEmail(email);

    if (!currentUser) {
      throw createError({ statusCode: 401, message: "Invalid email or password" });
    }

    const isValid = await verifyPassword(currentUser!.password, password);
    if (!isValid) {
      throw createError({ statusCode: 401, message: "Invalid email or password" });
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

    if (currentUser.role === "student") {
      const existingStudent = await getOnboardedStudent(currentUser.id);
      if (existingStudent) {
        // Update session to mark as onboarded
        await setUserSession(event, {
          ...session,
          onboarded: true,
        });
      }
    }

    if (rememberMe) {
      const sessionCookieName = session.name!;
      const currentSessionCookie = getCookie(event, sessionCookieName);

      if (currentSessionCookie) {
        setCookie(event, sessionCookieName, currentSessionCookie, {
          maxAge: 60 * 60 * 24 * 7, // 7 days
          httpOnly: true,
          sameSite: "lax",
          path: "/",
          secure: nodeEnv === "production",
        });
      }
    }

    await updateUserLastLogin(currentUser.id);

    const userRole = currentUser.role;

    return {
      success: true,
      message: `Login successful. Redirecting to your ${userRole} dashboard`,
    };
  }
  catch (error) {
    if (error && typeof error === "object" && "statusCode" in error) {
      throw error;
    }

    handleAuthError(error);
  }
});

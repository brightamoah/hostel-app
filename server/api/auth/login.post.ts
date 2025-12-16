import type { User } from "#auth-utils";

import { userQueries } from "~~/server/db/queries/user";
import { handleError } from "~~/server/utils/errorHandler";

export default defineEventHandler(async (event) => {
  try {
    const { session: sessionConfig, nodeEnv } = useRuntimeConfig();

    const rawIp = getRequestIP(event, { xForwardedFor: true }) || event.node?.req?.socket?.remoteAddress;
    const ip = normalizeIp(rawIp);

    if (!ip || ip === "undefined") {
      throw createError({
        statusCode: 400,
        message: "Invalid request",
      });
    }

    const {
      updateUserLastLogin,
      getOnboardedStudent,
      getUserByEmail,
      getAdminByUserId,
      recordLoginAttempt,
    } = await userQueries();

    const body = await readValidatedBody(event, body => loginSchema.safeParse(body));

    if (!body.success) {
      throw createError({
        statusCode: 400,
        message: `Invalid request: ${body.error.issues
          .map(i => i.message)
          .join(", ")}`,
      });
    }

    const { email, password, rememberMe } = body.data;

    if (!email || !password) {
      throw createError({
        statusCode: 400,
        message: "Email and password required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    await checkUserLockedOutByIp(ip);

    const currentUser = await getUserByEmail(normalizedEmail);

    if (!currentUser) {
      await recordLoginAttempt(null, ip);
      throw createError({
        statusCode: 401,
        message: "Invalid email or password: please try again.",
      });
    }

    await checkUserLockOutByUserId(currentUser.id, ip);

    const isValid = await verifyPassword(currentUser.password, password);
    if (!isValid) {
      await recordLoginAttempt(currentUser.id, ip);
      throw createError({
        statusCode: 401,
        message: "Invalid email or password",
      });
    }

    if (!currentUser.emailVerified) {
      await recordLoginAttempt(currentUser.id, ip);
      throw createError({
        statusCode: 403,
        message: "Email not verified",
      });
    }

    let adminData: User["adminData"] | null = null;

    adminData = currentUser.role === "admin"
      ? await getAdminByUserId(currentUser.id, true)
      : null;

    if (currentUser.role === "admin" && !adminData) {
      throw createError({
        statusCode: 403,
        message: "Admin details not found. Please contact support.",
      });
    }

    await recordLoginAttempt(
      currentUser.id,
      ip,
      true,
    );

    let isOnboarded = false;

    if (currentUser.role === "student") {
      const existingStudent = await getOnboardedStudent(currentUser.id);

      isOnboarded = !!existingStudent;
    }

    const now = new Date();

    const sessionDurationMs = 1000 * 60 * 60 * 24 * 7; // 7 days
    const expiresAt = new Date(now.getTime() + sessionDurationMs);

    await setUserSession(event, {
      user: {
        id: currentUser.id,
        email: currentUser.email,
        role: currentUser.role,
        image: currentUser.image,
        name: currentUser.name,
        emailVerified: currentUser.emailVerified,
        updatedAt: currentUser.updatedAt,
        lastLogin: currentUser.lastLogin,
        adminData,
      } as User,
      loggedInAt: now,
      expiresAt,
      onboarded: isOnboarded,
    });

    if (rememberMe) {
      const sessionCookieName = sessionConfig.name;
      const currentSessionCookie = getCookie(event, sessionCookieName)!;

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
    if (error && typeof error === "object" && "statusCode" in error) throw error;

    handleError(error, "User Login", event);
  }
});

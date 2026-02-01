import type { H3Event } from "h3";

export async function adminSessionCheck(event: H3Event): Promise<{
  isActiveAdmin: true;
  adminData: Admin;
  userId: number;
}> {
  const session = await requireUserSession(event);

  if (
    session.user.role !== "admin"
    || !session.user.adminData
    || session.user.adminData.status !== "active"
  ) {
    throw createError({
      statusCode: 403,
      message: "Access denied: Must be a verified active admin.",
    });
  }

  return {
    isActiveAdmin: true,
    adminData: session.user.adminData,
    userId: session.user.id,
  };
}

export async function studentSessionCheck(event: H3Event): Promise<{
  isActiveStudent: true;
  userId: number;
  studentId: number;
}> {
  const session = await requireUserSession(event);
  const studentId = session.user?.studentId;

  if (
    session.user.role !== "student"
    || typeof studentId !== "number"
  ) {
    throw createError({
      statusCode: 403,
      message: "Forbidden: This endpoint is only accessible to students.",
    });
  }

  return {
    isActiveStudent: true,
    userId: session.user.id,
    studentId,
  };
}

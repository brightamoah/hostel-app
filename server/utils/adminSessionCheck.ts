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

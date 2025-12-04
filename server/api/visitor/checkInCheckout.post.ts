import { userQueries } from "~~/server/db/queries";

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event);

  await adminSessionCheck(event);

  const userId = session.user!.id;

  try {
    const body = await readValidatedBody(event, body => logActionSchema.safeParse(body));

    if (!body.success) {
      throw createError({
        statusCode: 400,
        message: `${body.error.issues
          .map(i => i.message)
          .join(", ")}`,
      });
    }

    const { action, visitorId } = body.data;

    const { getAdminByUserId } = await userQueries();

    const adminMakingRequest = await getAdminByUserId(
      userId,
      true,
    );

    if (!adminMakingRequest) {
      throw createError({
        statusCode: 403,
        message: "Account for the admin making the request not found or is inactive.",
      });
    }

    const newLog = await createVisitorLog(
      visitorId,
      action,
      adminMakingRequest,
    );

    return {
      success: true,
      message: `Visitor has been successfully checked ${action === "check_in" ? "in" : "out"}.`,
      log: newLog,
    };
  }
  catch (error) {
    if (error && typeof error === "object" && "statusCode" in error) throw error;

    handleError(error, "Check-in/Check-out Visitor", event);
  }
});

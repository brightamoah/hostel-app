import { userQueries } from "~~/server/db/queries/user";

import { promoteDemoteSchema } from "~/utils/schema";

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event);

  if (
    !session
    || !session.user
    || session.user.role !== "admin"
    || session.user.adminData?.status !== "active"
  ) {
    throw createError({
      statusCode: 403,
      message: "Access denied: Must be a verified active admin",
    });
  }

  try {
    const body = await readValidatedBody(event, body => promoteDemoteSchema.safeParse(body));

    if (!body.success) {
      throw createError({
        statusCode: 400,
        message: `Invalid data: ${body.error.issues.map(i => i.message).join(", ")}`,
      });
    }

    const currentUserId = session.user.id;

    const {
      userId,
      action,
      accessLevel,
      department,
      hostelId,
      phoneNumber,
    } = body.data;

    const {
      disableAdminByUserId,
      getAdminByUserId,
      getUserById,
      createOrUpdateAdminForUser,
    } = await userQueries(event);

    const adminMakingRequest = await getAdminByUserId(
      currentUserId,
      true,
    );

    if (!adminMakingRequest) {
      throw createError({
        statusCode: 403,
        message: "Account for the admin making the request not found or is inactive.",
      });
    }

    const targetUser = await getUserById(userId);

    if (!targetUser) {
      throw createError({
        statusCode: 404,
        message: "Target user not found.",
      });
    }

    switch (action) {
      case "demote": {
        if (adminMakingRequest.accessLevel !== "super") {
          throw createError({
            statusCode: 403,
            message: "Only super admins can demote other users.",
          });
        }

        if (currentUserId === userId) {
          throw createError({
            statusCode: 400,
            message: "You cannot demote your own account.",
          });
        }

        const targetAdmin = await getAdminByUserId(
          userId,
          false,
        );

        if (!targetAdmin) {
          throw createError({
            statusCode: 404,
            message: "Target user is not an admin.",
          });
        }

        const demotedAdmin = await disableAdminByUserId(userId);
        return {
          message: "Admin successfully demoted to student.",
          data: demotedAdmin,
        };
      }

      case "promote":{
        if (adminMakingRequest.accessLevel === "super") {
          const promotedAdmin = await createOrUpdateAdminForUser(userId, {
            phoneNumber: phoneNumber ?? "",
            department: department ?? "",
            accessLevel: accessLevel ?? "regular",
            hostelId: typeof hostelId === "number" ? hostelId : null,
          });
          return {
            message: "User successfully promoted.",
            data: promotedAdmin,
          };
        }

        if (accessLevel === "super") {
          throw createError({
            statusCode: 403,
            message: "Insufficient privileges to create a super admin.",
          });
        }

        if (!adminMakingRequest.hostelId) {
          throw createError({
            statusCode: 403,
            message: "Your admin account is not assigned to a hostel.",
          });
        }

        if (targetUser.role === "admin") {
          throw createError({
            statusCode: 409,
            message: "This user is already an admin.",
          });
        }

        const promotedAdmin = await createOrUpdateAdminForUser(userId, {
          phoneNumber: phoneNumber ?? "",
          department: department ?? "",
          accessLevel: (accessLevel as "regular" | "support") ?? "regular",
          hostelId: adminMakingRequest.hostelId,
        });

        return {
          message: `User promoted to admin for hostel ID ${adminMakingRequest.hostelId}.`,
          data: promotedAdmin,
        };
      }

      default:
        throw createError({
          statusCode: 400,
          message: "Invalid action type.",
        });
    }
  }
  catch (error) {
    if (error && typeof error === "object" && "statusCode" in error) {
      throw error;
    }

    handleError(error, "Promote/Demote User", event);
  }
});

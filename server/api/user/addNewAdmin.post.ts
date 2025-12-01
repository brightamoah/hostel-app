import { userQueries } from "~~/server/db/queries/user";
import { admin, user } from "~~/server/db/schema";
import { generateTempPassword } from "~~/server/utils/generateTemporaryPassword";
import { randomUUID } from "uncrypto";

import { getEmailTemplate, getWelcomeAdminTemplate } from "~/utils/emailTemplate";

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event);
  const creator = session.user;

  if (
    !creator
    || creator.role !== "admin"
    || creator.adminData?.status !== "active"
  ) {
    throw createError({
      statusCode: 403,
      message: "Access Denied: You must be an admin to perform this action.",
    });
  }

  const { db } = useDB();
  const {
    getAdminByUserId,
    checkIfUserExists,
  } = await userQueries();

  const creatorAdminDetails = await getAdminByUserId(creator.id);

  if (!creatorAdminDetails) {
    throw createError({
      statusCode: 403,
      message: "Could not verify creator's admin status.",
    });
  }

  const body = await readValidatedBody(event, b => addAdminSchema.safeParse(b));

  if (!body.success)
    throw createError({ statusCode: 400, message: body.error.issues.map(i => i.message).join(", ") });

  const {
    name,
    email,
    phoneNumber,
    department,
    accessLevel,
    hostelId,
    role,
  } = body.data;

  let assignedHostelId: number | null = null;

  if (creatorAdminDetails.accessLevel === "super") {
    assignedHostelId = hostelId ?? null;
  }

  else {
    if (!creatorAdminDetails.hostelId) {
      throw createError({
        statusCode: 400,
        message: "As a regular admin, you must be assigned to a hostel to create new admins.",
      });
    }

    assignedHostelId = creatorAdminDetails.hostelId;
  }

  if (accessLevel !== "super" && !assignedHostelId) {
    throw createError({
      statusCode: 400,
      message: "Regular and Support admins must be assigned to a hostel.",
    });
  }

  const existingUser = await checkIfUserExists(email);
  if (existingUser) {
    throw createError({
      statusCode: 409,
      message: "A user with this email already exists.",
    });
  }

  const generatedPassword = generateTempPassword();
  const passwordHash = await hashPassword(generatedPassword);
  const verificationToken = randomUUID();
  const hashedVerificationToken = await hash(verificationToken);

  try {
    const newAdminUser = await db.transaction(async (txn) => {
      const [newUser] = await txn
        .insert(user)
        .values({
          name,
          email,
          password: passwordHash,
          role,
          verificationToken: hashedVerificationToken,
          verificationTokenExpiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 mins from now
        })
        .returning();

      if (!newUser) {
        txn.rollback();
        throw createError({
          statusCode: 500,
          message: "Failed to create user record.",
        });
      }

      const [newAdmin] = await txn
        .insert(admin)
        .values({
          userId: newUser.id,
          phoneNumber,
          department,
          accessLevel,
          hostelId: assignedHostelId,
        })
        .returning();

      if (!newAdmin) {
        txn.rollback();
        throw createError({
          statusCode: 500,
          message: "Failed to create admin record.",
        });
      }

      return { ...newUser, ...newAdmin };
    });

    const { sendMail } = useNodeMailer();
    const { html, text } = getWelcomeAdminTemplate(
      name,
      email,
      generatedPassword,
    );

    await sendMail({
      to: email,
      subject: "Your Kings Hostel Management Admin Account Details",
      html,
      text,
    });

    const verificationUrl = `${event.headers.get("origin")}/auth/verifyEmail?token=${verificationToken}&id=${newAdminUser.userId}`;

    const {
      htmlTemplate,
      textTemplate,
    } = getEmailTemplate(verificationUrl, newAdminUser);

    await sendMail({
      to: email,
      subject: "Verify your email address - Kings Hostel Management",
      html: htmlTemplate,
      text: textTemplate,
    });

    return {
      success: true,
      message: "Admin created successfully. Credentials and verification link sent to their email.",
    };
  }
  catch (error) {
    if (error && typeof error === "object" && "statusCode" in error)
      throw error;

    handleError(error, "Add New Admin", event);
  }
});

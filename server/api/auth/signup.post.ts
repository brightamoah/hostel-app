import { userQueries } from "~~/server/db/queries/user";
import { user } from "~~/server/db/schema/index";
import { useDB } from "~~/server/utils/db";
import { handleError } from "~~/server/utils/errorHandler";
import { randomUUID } from "uncrypto";

import { getEmailTemplate } from "~/utils/emailTemplate";

export default defineEventHandler(async (event) => {
  try {
    await clearUserSession(event);

    const runtimeConfig = useRuntimeConfig(event);

    const { db } = useDB();
    const { getUserByEmail } = await userQueries();

    const body = await readValidatedBody(event, body => baseSignupSchema.safeParse(body));

    if (!body.success) {
      throw createError({
        statusCode: 400,
        message: `Invalid request: ${body.error.issues
          .map(i => i.message)
          .join(", ")}`,
      });
    }

    const { email, name, password } = body.data;

    if (!email || !password || !name) {
      throw createError({
        statusCode: 400,
        message: "Name, email, and password are required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await getUserByEmail(normalizedEmail);
    if (existingUser) {
      throw createError({
        statusCode: 409,
        message: "An account with this email already exists",
      });
    }

    // const passwordHash = await hashPassword(password);
    const passwordHash = await hashPasswordWorker(password);

    const verificationToken = randomUUID();

    const hashedVerificationToken = await hash(verificationToken);

    const verificationTokenExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins from now

    const [newUser] = await db.insert(user).values({
      email: normalizedEmail,
      password: passwordHash,
      verificationToken: hashedVerificationToken,
      verificationTokenExpiresAt,
      name,
    }).returning();

    if (!newUser) {
      throw createError({
        statusCode: 500,
        message: "Failed to create user",
      });
    }

    const siteUrl = runtimeConfig.public.siteUrl || getRequestURL(event).origin;
    const verificationUrl = `${siteUrl}/auth/verifyEmail?token=${verificationToken}&id=${newUser.id}`;

    const { htmlTemplate, textTemplate } = getEmailTemplate(verificationUrl, newUser);

    try {
      if (import.meta.dev) {
        const { sendMail } = useNodeMailer();

        await sendMail({
          to: email,
          subject: "Verify your email address - Kings Hostel Management",
          html: htmlTemplate,
          text: textTemplate,
        });
      }
      else {
        const mailer = await useWorkerMailer();

        await mailer.send({
          from: { name: runtimeConfig.emailFromName, email: runtimeConfig.emailFromEmail },
          to: { name: newUser.name, email },
          subject: "Verify your email address - Kings Hostel Management",
          html: htmlTemplate,
          text: textTemplate,
        });

        if (typeof mailer.close === "function") mailer.close();
      }
    }
    catch (emailError) {
      console.error("Failed to send verification email:", emailError);
    }

    return {
      success: true,
      message: "Signup successful. Please check your email for verification.",
    };
  }
  catch (error) {
    if (error && typeof error === "object" && "statusCode" in error) throw error;

    handleError(error, "User Signup", event);
  }
});

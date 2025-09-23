import { userQueries } from "~~/server/db/queries/user";
import { user } from "~~/server/db/schema";
import { useDB } from "~~/server/utils/db";
import { eq } from "drizzle-orm";
import { randomUUID } from "uncrypto";

import { getEmailTemplate } from "~/utils/emailTemplate";
import { verifyEmailSchema } from "~/utils/schema";

export default defineEventHandler(async (event) => {
  const { db } = useDB();

  const body = await readValidatedBody(event, body =>
    verifyEmailSchema.safeParse(body));

  if (!body.success)
    throw body.error.issues;

  const { email } = body.data;

  const { getUserByEmail } = await userQueries(event);

  const existingUser = await getUserByEmail(email);

  if (!existingUser) {
    return { success: true, message: "If an account exists, a verification email has been sent." };
  }

  if (existingUser.emailVerified) {
    throw createError({
      statusCode: 400,
      message: "Your email is already verified. Please log in.",
    });
  }

  const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);

  if (existingUser.verificationTokenExpiresAt
    && existingUser.verificationTokenExpiresAt > twoMinutesAgo) {
    const timeLeft = Math.ceil((existingUser.verificationTokenExpiresAt.getTime() - twoMinutesAgo.getTime()) / 1000 / 60);
    throw createError({
      statusCode: 429,
      message: `Please wait ${timeLeft} minutes before requesting another verification email.`,
    });
  }

  const verificationToken = randomUUID();
  const tokenExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  // Update user with new token
  await db.update(user).set({
    verificationToken,
    verificationTokenExpiresAt: tokenExpiresAt,
  }).where(eq(user.id, existingUser.id));

  const verificationUrl = `${event.headers.get("origin")}/auth/verifyEmail?token=${verificationToken}`;
  const { sendMail } = useNodeMailer();
  const { htmlTemplate, textTemplate } = getEmailTemplate(verificationUrl, existingUser);

  await sendMail({
    to: email,
    subject: "Verify your email address - Kings Hostel Management",
    html: htmlTemplate,
    text: textTemplate,
  });

  return {
    success: true,
    message: "Verification email sent! Please check your inbox and spam folder.",
  };
});

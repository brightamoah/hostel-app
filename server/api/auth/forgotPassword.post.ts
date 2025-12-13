import { userQueries } from "~~/server/db/queries/user";
import { user } from "~~/server/db/schema";
import { handleError } from "~~/server/utils/errorHandler";
import { hash } from "~~/server/utils/saltHash";
import { eq } from "drizzle-orm";
import { randomUUID } from "uncrypto";

import { getResetPasswordTemplate } from "~/utils/emailTemplate";

export default defineEventHandler(async (event) => {
  try {
    const { db } = useDB();
    const runtimeConfig = useRuntimeConfig(event);

    const body = await readValidatedBody(event, body => verifyEmailSchema.safeParse(body));

    if (!body.success) {
      throw createError({
        statusCode: 400,
        message: `Invalid request: ${body.error.issues
          .map(i => i.message)
          .join(", ")}`,
      });
    }

    const { email } = body.data;
    const { getUserByEmail } = await userQueries();

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await getUserByEmail(normalizedEmail);

    if (!existingUser || !existingUser.emailVerified) return { success: true, message: "If an account exists, a reset email has been sent." };

    const resetToken = randomUUID();
    const hashedToken = await hash(resetToken);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    await db.update(user)
      .set({
        resetToken: hashedToken,
        resetTokenExpiresAt: expiresAt,
      })
      .where(eq(user.id, existingUser.id));

    const resetUrl = `${event.headers.get("origin")}/auth/resetPassword?token=${resetToken}&id=${existingUser.id}`;

    const { html, text } = getResetPasswordTemplate(resetUrl, existingUser.name);

    if (import.meta.dev) {
      const { sendMail } = useNodeMailer();

      await sendMail({
        to: normalizedEmail,
        subject: "Reset Your Password - Kings Hostel Management",
        html,
        text,
      });
    }
    else {
      const mailer = await useWorkerMailer();

      await mailer.send({
        from: { name: runtimeConfig.emailFromName, email: runtimeConfig.emailFromEmail },
        to: { name: existingUser.name, email: normalizedEmail },
        subject: "Reset Your Password - Kings Hostel Management",
        html,
        text,
      });

      mailer.close();
    }

    return {
      success: true,
      message: "Password reset email sent. Check your inbox or spam.",
    };
  }
  catch (error) {
    handleError(error, "Forgot Password", event);
  }
});

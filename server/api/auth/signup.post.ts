import { user } from "~~/server/db/schema/index";
import { handleAuthError } from "~~/server/utils/authErrorHandler";
import { useDB } from "~~/server/utils/db";
import { eq } from "drizzle-orm";
import { randomUUID } from "uncrypto";

import { getEmailTemplate } from "~/utils/emailTemplate";
import { baseSignupSchema } from "~/utils/schema";

export default defineEventHandler(async (event) => {
  try {
    await clearUserSession(event);

    const { db } = useDB();

    const body = await readValidatedBody(event, body => baseSignupSchema.safeParse(body));

    if (!body.success)
      throw body.error.issues;

    const { email, name, password } = body.data;

    if (!email || !password || !name) {
      throw createError({ statusCode: 400, message: "Name, email, and password are required" });
    }

    const existingUser = await db.query.user.findFirst({ where: eq(user.email, email) });
    if (existingUser) {
      throw createError({ statusCode: 409, message: "An account with this email already exists" });
    }

    const passwordHash = await hashPassword(password);

    const verificationToken = randomUUID();

    const verificationTokenExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 from now

    const [newUser] = await db.insert(user).values({
      email,
      password: passwordHash,
      verificationToken,
      verificationTokenExpiresAt,
      name,
    }).returning();

    const verificationUrl = `${event.headers.get("origin")}/auth/verifyEmail?token=${verificationToken}`;
    const { sendMail } = useNodeMailer();
    const { htmlTemplate, textTemplate } = getEmailTemplate(verificationUrl, newUser!);

    await sendMail({
      to: email,
      subject: "Verify your email address - Kings Hostel Management",
      html: htmlTemplate,
      text: textTemplate,
    });

    return { success: true, message: "Signup successful. Please check your email for verification." };
  }
  catch (error) {
    handleAuthError(error);
  }
});

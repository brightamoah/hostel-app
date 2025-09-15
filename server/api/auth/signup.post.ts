import { user } from "~~/server/db/schema/index";
import { eq } from "drizzle-orm";
import { randomUUID } from "node:crypto";

import type { User } from "~/types";

import { db } from "~/db/index";
import { getEmailTemplate } from "~/utils/emailTemplate";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { name, email, password } = body;

  if (!email || !password) {
    throw createError({ statusCode: 400, message: "Email and password required" });
  }

  const existingUser = await db.query.user.findFirst({ where: eq(user.email, email) });
  if (existingUser) {
    throw createError({ statusCode: 409, message: "User already exists" });
  }

  const passwordHash = await hashPassword(password);

  const verificationToken = randomUUID();

  const [newUser] = await db.insert(user).values({
    email,
    password: passwordHash,
    verificationToken,
    name,
  }).returning();

  await setUserSession(event, {
    user: {
      id: newUser.id,
      email: newUser.email,
      role: newUser.role,
      image: newUser.image,
      name: newUser.name,
      emailVerified: newUser.emailVerified,
      updatedAt: newUser.updatedAt,
      lastLogin: newUser.lastLogin,
    } as User,
    loggedInAt: Date.now(),
  });

  const verificationUrl = `${event.headers.get("origin")}/auth/verifyEmail?token=${verificationToken}`;
  const { sendMail } = useNodeMailer();
  const { htmlTemplate, textTemplate } = getEmailTemplate(verificationUrl, newUser!);

  await sendMail({
    to: email,
    subject: "Verify your email address - Kings Hostel Management",
    html: htmlTemplate,
    text: textTemplate,
  });

  return sendRedirect(event, "/auth/verifyEmail");
});

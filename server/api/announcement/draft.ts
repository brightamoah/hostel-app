import { kv } from "~~/server/types/kv.d";
import z from "zod";

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event, {
    message: "Unauthorized, please log in to access announcement drafts.",
  });

  await kv.clear();

  const KEY = `announcement-draft-${user.id}`;

  if (event.method === "GET") {
    const draft = await kv.get(KEY);
    return draft || null;
  }

  if (event.method === "POST") {
    const body = await readBody(event);

    const cleanBody = Object.fromEntries(
      Object.entries(body).map(([key, value]) => [
        key,
        value === "" ? undefined : value,
      ]),
    );

    const result = z.object(createAnnouncementSchema.shape).partial().safeParse(cleanBody);

    if (!result.success) {
      throw createError({
        statusCode: 400,
        message: `${result.error.issues
          .map(i => i.message)
          .join(", ")}`,
      });
    }

    await kv.set(KEY, body);

    return { success: true, message: "Draft saved successfully." };
  }

  if (event.method === "DELETE") {
    await kv.del(KEY);
    return { success: true };
  }
});

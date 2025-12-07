export default defineEventHandler(async (event) => {
  const { user } = await getUserSession(event);

  if (!user) throw createError({ statusCode: 401, statusMessage: "Unauthorized" });

  const kv = hubKV();

  const KEY = `announcement-draft-${user.id}`;

  if (event.method === "GET") {
    const draft = await kv.get<CreateAnnouncementSchema>(KEY);
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

    const result = createAnnouncementSchema.partial().safeParse(cleanBody);

    if (!result.success) {
      throw createError({
        statusCode: 400,
        message: `${result.error.issues
          .map(i => i.message)
          .join(", ")}`,
      });
    }

    await kv.set(KEY, body);

    return { success: true };
  }

  if (event.method === "DELETE") {
    await kv.del(KEY);
    return { success: true };
  }
});

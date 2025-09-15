export default defineEventHandler(async (event) => {
  await clearUserSession(event);
  return sendRedirect(event, "/auth/login");
});

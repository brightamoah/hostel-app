import { handleAuthError } from "~~/server/utils/authErrorHandler";

export default defineEventHandler(async (event) => {
  try {
    await clearUserSession(event);
    return sendRedirect(event, "/auth/login");
  }
  catch (error) {
    handleAuthError(error);
  }
});

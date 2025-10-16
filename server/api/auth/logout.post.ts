import { handleError } from "~~/server/utils/errorHandler";

export default defineEventHandler(async (event) => {
  try {
    await clearUserSession(event);
    return sendRedirect(event, "/auth/login");
  }
  catch (error) {
    handleError(error, "User Logout", event);
  }
});

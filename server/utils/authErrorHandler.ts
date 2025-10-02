export function handleAuthError(error: any): never {
  console.error("Authentication Error:", error);

  if (error?.code === "42P01") { // Undefined table error code in PostgreSQL
    throw createError({
      statusCode: 503,
      message: "Service temporarily unavailable. Please try again later.",
    });
  }

  if (error?.code === "ECONNREFUSED" || error?.message?.includes("connection")) {
    throw createError({
      statusCode: 503,
      message: "Unable to connect to the service. Please check your internet connection and try again.",
    });
  }

  // Map other auth-specific errors
  if (error?.statusCode === 401) {
    throw createError({
      statusCode: 401,
      message: "Invalid email or password",
    });
  }

  if (error?.statusCode === 409) {
    throw createError({
      statusCode: 409,
      message: "An account with this email already exists",
    });
  }

  if (error?.statusCode === 400) {
    throw createError({
      statusCode: 400,
      message: "Invalid request. Please check your input.",
    });
  }

  if (error?.statusCode === 429) {
    throw createError({
      statusCode: 429,
      message: "Too many attempts. Please wait and try again.",
    });
  }

  // Generic fallback for other errors
  throw createError({
    statusCode: 500,
    message: "An unexpected error occurred. Please try again.",
  });
}

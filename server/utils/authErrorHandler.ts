/**
 * Centralized Authentication Error Handler
 * ----------------------------------------
 * Handles known database, validation, and authentication errors,
 * logs safely (without leaking sensitive info), and provides
 * user-friendly messages and appropriate HTTP status codes.
 */

export function handleAuthError(error: unknown): never {
  // Always log structured details for debugging (server only)

  const runtimeConfig = useRuntimeConfig();

  console.error("[Auth Error]", {
    name: (error as any)?.name,
    message: (error as any)?.message,
    code: (error as any)?.code,
    stack: runtimeConfig.nodeEnv === "development" ? (error as any)?.stack : undefined,
  });

  // Normalize error object
  const err = error as { code?: string; statusCode?: number; message?: string };

  // --- Database-level Errors ---
  switch (err?.code) {
    case "42P01": // undefined_table
      throw createError({
        statusCode: 503,
        message: "Database temporarily unavailable. Please try again later.",
      });

    case "23505": // unique_violation
      throw createError({
        statusCode: 409,
        message: "This record already exists. Please use a different email or username.",
      });

    case "23503": // foreign_key_violation
      throw createError({
        statusCode: 400,
        message: "Invalid reference to another record. Please check your input.",
      });

    case "ECONNREFUSED":
    case "ETIMEDOUT":
      throw createError({
        statusCode: 503,
        message: "Unable to connect to the database. Please try again later.",
      });
  }

  // --- Network / Connection issues ---
  if (err?.message?.includes("connection")) {
    throw createError({
      statusCode: 503,
      message: "Network error. Please check your internet connection and try again.",
    });
  }

  // --- Authentication & Authorization Errors ---
  if (err?.statusCode === 401) {
    throw createError({
      statusCode: 401,
      message: "Unauthorized. Invalid credentials or session expired.",
    });
  }

  if (err?.statusCode === 403) {
    throw createError({
      statusCode: 403,
      message: "Forbidden. You don't have permission to perform this action.",
    });
  }

  if (err?.statusCode === 409) {
    throw createError({
      statusCode: 409,
      message: "Conflict. This account or record already exists.",
    });
  }

  // --- Client Errors ---
  if (err?.statusCode === 400) {
    throw createError({
      statusCode: 400,
      message: "Bad request. Please verify your input and try again.",
    });
  }

  if (err?.statusCode === 404) {
    throw createError({
      statusCode: 404,
      message: "Resource not found. Please check the request path or ID.",
    });
  }

  if (err?.statusCode === 422) {
    throw createError({
      statusCode: 422,
      message: "Invalid or unprocessable data. Please correct and try again.",
    });
  }

  if (err?.statusCode === 429) {
    throw createError({
      statusCode: 429,
      message: "Too many requests. Please wait and try again later.",
    });
  }

  // --- Token or session-related errors ---
  if (err?.message?.includes("token")) {
    throw createError({
      statusCode: 401,
      message: "Invalid or expired token. Please log in again.",
    });
  }

  // --- Fallback for all unexpected errors ---
  throw createError({
    statusCode: 500,
    message: "An unexpected error occurred. Please try again later.",
  });
}

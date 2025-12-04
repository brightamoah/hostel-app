import type { H3Event } from "h3";

type StructuredError = {
  statusCode?: number;
  statusMessage?: string;
  data?: any;
} & Error;

export function handleError(
  error: unknown,
  context: string,
  event?: H3Event,
): never {
  const runtimeConfig = useRuntimeConfig();
  const err = error as StructuredError;

  console.error(`[${context} Error] (Path: ${event?.path || "N/A"})`, {
    name: err.name,
    message: err.message,
    code: (error as any)?.code, // For Drizzle/Postgres codes
    statusCode: err.statusCode, // For H3 Errors
    stack: runtimeConfig.nodeEnv === "development" ? err.stack : undefined,
  });

  switch ((error as any)?.code) {
    case "23505": // unique_violation
      throw createError({
        statusCode: 409,
        message: "A record with one or more of the provided values already exists.",
        statusMessage: "Conflict",
      });

    case "23503": // foreign_key_violation
      throw createError({
        statusCode: 400,
        message: "Invalid association. One or more related entities do not exist.",
        statusMessage: "Bad Request",
      });

    case "42P01": // undefined_table
      throw createError({
        statusCode: 503,
        message: "Database schema error. Please contact support.",
        statusMessage: "Service Unavailable",
      });
  }

  // If the error already has a status code, it was thrown deliberately with createError.
  if (err?.statusCode) throw error;

  const rawMessage = String(err?.data?.message ?? err?.message ?? "").trim();
  const lower = rawMessage.toLowerCase();

  const serverPatterns = [
    "failed query",
    "syntax error",
    "duplicate key",
    "relation",
    "internal server error",
    "null value in column",
    "permission denied",
  ];

  if (serverPatterns.some(p => lower.includes(p))) {
    // keep original error in server console for debugging
    console.error(`Error (${context}):`, err);

    throw createError({
      statusCode: 500,
      message: "Server error. Please check your network and try again later.",
      statusMessage: "Server Network Unavailable",
    });
  }

  // Generic fallback for unhandled errors
  throw createError({
    statusCode: 500,
    message: `An unexpected server error occurred. Details: ${err.message || "Unknown error."}`,
    statusMessage: "Internal Server Error",
  });
}

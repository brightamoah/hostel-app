export function getSpecificRoomError() {
  function isNetworkError(err: any): boolean {
    const message = String(err?.message ?? "").toLowerCase();
    return (
      message.includes("failed to fetch")
      || message.includes("<no response>")
      || message.includes("net::err_")
      || message.includes("connection refused")
    );
  }

  type RoomError = { icon?: string; message: string };

  function getErrorMessage(err: any): RoomError {
    if (!err) {
      return {
        icon: "i-lucide-alert-triangle",
        message: "An unknown error occurred while loading room details.",
      };
    }

    if (isNetworkError(err)) {
      return {
        icon: "i-lucide-wifi-off",
        message: "Could not connect to the server. Please check your internet connection and try again.",
      };
    }

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
      // console.error("Room details fetch error (server):", err);
      return {
        icon: "i-lucide-server-crash",
        message: "Server error while loading room details. Network unavailable. Please try again later.",
      };
    }

    if (err?.data?.message) {
      return {
        icon: "i-lucide-alert-triangle",
        message: String(err.data.message),
      };
    }

    if (rawMessage) {
      return {
        icon: "i-lucide-alert-triangle",
        message: rawMessage,
      };
    }

    return {
      icon: "i-lucide-alert-triangle",
      message: "An unknown error occurred while loading room details.",
    };
  }

  return { getErrorMessage, isNetworkError };
}

/**
 * Formats API and runtime errors into clear, non-technical, user-friendly messages.
 * Prevents technical internal exception details (SQL, JDBC, StackTraces, HTTP status codes)
 * from leaking to end users.
 */
export function formatApiError(err: unknown, defaultMessage = "Something went wrong. Please try again."): string {
  let rawMessage = "";

  if (typeof err === "string") {
    rawMessage = err;
  } else if (err && typeof err === "object") {
    const axiosErr = err as {
      response?: {
        data?: {
          message?: string;
          error?: string;
          errors?: Record<string, string>;
        };
        status?: number;
      };
      message?: string;
    };

    const resData = axiosErr.response?.data;

    // 1. If structured validation errors exist (e.g. { errors: { email: "Email is invalid" } })
    if (resData?.errors && typeof resData.errors === "object") {
      const firstFieldErr = Object.values(resData.errors)[0];
      if (firstFieldErr) return firstFieldErr;
    }

    // 2. Extract message from backend response or Error instance
    if (resData?.message) {
      rawMessage = resData.message;
    } else if (resData?.error) {
      rawMessage = resData.error;
    } else if (axiosErr.message) {
      rawMessage = axiosErr.message;
    }
  }

  if (!rawMessage) return defaultMessage;

  // 3. Technical terminology filter — map developer-oriented terms to human friendly text
  const technicalTerms = [
    "PSQLException",
    "JDBC",
    "Hibernate",
    "SQLException",
    "NullPointerException",
    "ConstraintViolationException",
    "org.postgresql",
    "couldn't fetch data",
    "could not fetch",
    "Internal Server Error",
    "status code 500",
    "500 error",
    "SQLState",
    "Network Error",
    "Failed to execute",
    "cannot execute",
    "CannotGetJdbcConnectionException",
    "foreign key constraint",
    "violates unique constraint",
  ];

  const lowerRaw = rawMessage.toLowerCase();
  const isTechnical = technicalTerms.some((term) => lowerRaw.includes(term.toLowerCase()));

  if (isTechnical) {
    if (lowerRaw.includes("network") || lowerRaw.includes("connection") || lowerRaw.includes("connect")) {
      return "We're having trouble connecting to our servers. Please check your connection and try again.";
    }
    return "We are currently experiencing technical difficulties. Please try again in a few moments.";
  }

  // 4. Map standard status codes or raw HTTP error messages
  if (lowerRaw.includes("status code 404") || lowerRaw.includes("404")) {
    return "The requested information could not be found.";
  }
  if (lowerRaw.includes("status code 403") || lowerRaw.includes("403")) {
    return "You do not have permission to perform this action.";
  }
  if (lowerRaw.includes("status code 401") || lowerRaw.includes("401")) {
    return "Your session has expired. Please log in again.";
  }
  if (lowerRaw.includes("status code 429") || lowerRaw.includes("429")) {
    return "Too many requests. Please wait a moment and try again.";
  }

  // 5. Clean up any remaining "Error: " prefix
  return rawMessage.replace(/^Error:\s*/i, "");
}

export function formatApiError(err: unknown, defaultMessage = "An unexpected error occurred"): string {
  // 1. Try to extract custom message from backend response
  const customMessage = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
  if (customMessage) {
    return customMessage;
  }

  // 2. Fallback to generic Error object message, and map technical ones to friendly ones
  if (err instanceof Error) {
    if (err.message === "Network Error") {
      return "We're having trouble connecting to the server. Please check your internet connection and try again.";
    }
    if (err.message.includes("status code 500")) {
      return "Something went wrong on our end. Please try again later.";
    }
    if (err.message.includes("status code 404")) {
      return "The requested information could not be found.";
    }
    if (err.message.includes("status code 403")) {
      return "You do not have permission to perform this action.";
    }
    if (err.message.includes("status code 401")) {
      return "Your session has expired. Please log in again.";
    }
    if (err.message.includes("status code 429")) {
      return "You are making too many requests. Please wait a moment and try again.";
    }
    return err.message;
  }

  // 3. Absolute fallback
  return defaultMessage;
}

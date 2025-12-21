type ErrorOptions = {
  status?: number;
  context?: string;
  errorCode?: string;
};

/**
 * Create a consistent JSON error response for all API routes.
 *
 * Shape:
 * {
 *   "error": "High-level message for the client",
 *   "errorCode": "MACHINE_READABLE_CODE",
 *   "details": "Original error message (for debugging)",
 *   "context": "Route or operation where it occurred"
 * }
 */
export function createErrorResponse(
  error: unknown,
  fallbackMessage: string,
  options: ErrorOptions = {},
): Response {
  const baseStatus = options.status ?? 500;
  const context = options.context;

  const originalMessage =
    error instanceof Error ? error.message : "Unknown server error.";

  // Try to infer a more specific status / errorCode from the error message.
  const { status, errorCode } = inferErrorMetadata(
    originalMessage,
    baseStatus,
    options.errorCode,
  );

  const body = {
    error: fallbackMessage,
    errorCode,
    details: originalMessage,
    ...(context ? { context } : {}),
  };

  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function inferErrorMetadata(
  message: string,
  defaultStatus: number,
  explicitCode?: string,
): { status: number; errorCode: string } {
  // Respect an explicit errorCode if provided by the caller.
  if (explicitCode) {
    return { status: defaultStatus, errorCode: explicitCode };
  }

  const normalized = message.toLowerCase();

  // Missing API key (server misconfiguration)
  if (normalized.includes("api key is missing")) {
    return { status: 500, errorCode: "GEMINI_API_KEY_MISSING" };
  }

  // Invalid API key (authentication error)
  if (
    normalized.includes("invalid api key") ||
    normalized.includes("authentication") ||
    normalized.includes("permission denied") ||
    normalized.includes("api key not valid")
  ) {
    return { status: 401, errorCode: "INVALID_API_KEY" };
  }

  // Unsupported video source / invalid URL
  if (normalized.includes("only youtube urls are supported")) {
    return { status: 400, errorCode: "UNSUPPORTED_VIDEO_SOURCE" };
  }

  // Direct Gemini API error from REST client
  if (normalized.includes("gemini api error")) {
    return { status: 502, errorCode: "GEMINI_UPSTREAM_ERROR" };
  }

  // Generic validation errors
  if (
    normalized.includes("missing or invalid") ||
    normalized.startsWith("missing ") ||
    normalized.includes("invalid")
  ) {
    return { status: 400, errorCode: "INVALID_REQUEST" };
  }

  // Fallback: internal error
  return { status: defaultStatus, errorCode: "INTERNAL_SERVER_ERROR" };
}



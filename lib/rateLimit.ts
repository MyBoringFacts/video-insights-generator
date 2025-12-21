/**
 * Rate Limiting Utility
 * 
 * This providesn dummy rate limiting for API routes. 
 */

export type RateLimitConfig = {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
};

type RateLimitResult = {
  success: boolean;
  remaining: number;
  reset: number; // Unix timestamp when the limit resets
  limit: number;
};

// In-memory store (for development/single-instance)
// For production with multiple instances, you should  use Redis or similar,  please do not use it like this , its not good for your system bc its a dummy . to whoever reading this code lol.
const requestCounts = new Map<
  string,
  { count: number; resetTime: number }
>();
 
// Clean up old entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of requestCounts.entries()) {
    if (value.resetTime < now) {
      requestCounts.delete(key);
    }
  }
}, 60000); // Clean up every minute

/**
 * Rate limit check
 * @param identifier - Unique identifier (e.g., user ID, IP address)
 * @param config - Rate limit configuration
 * @returns Rate limit result
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now();
  const key = identifier;
  const record = requestCounts.get(key);

  // If no record exists or window has expired, create new record
  if (!record || record.resetTime < now) {
    requestCounts.set(key, {
      count: 1,
      resetTime: now + config.windowMs,
    });

    return {
      success: true,
      remaining: config.maxRequests - 1,
      reset: now + config.windowMs,
      limit: config.maxRequests,
    };
  }

  // If limit exceeded
  if (record.count >= config.maxRequests) {
    return {
      success: false,
      remaining: 0,
      reset: record.resetTime,
      limit: config.maxRequests,
    };
  }

  // Increment count
  record.count++;
  requestCounts.set(key, record);

  return {
    success: true,
    remaining: config.maxRequests - record.count,
    reset: record.resetTime,
    limit: config.maxRequests,
  };
}

/**
 * Get client identifier from request
 * Prioritizes user ID (authenticated) over IP address
 */
export function getClientIdentifier(
  userId: string | null,
  ipAddress: string | null
): string {
  // Use user ID if authenticated, otherwise fall back to IP
  return userId || ipAddress || "anonymous";
}

/**
 * Get IP address from request
 */
export function getIpAddress(request: Request): string | null {
  // Try various headers that might contain the real IP
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp;
  }

  return null;
}

/**
 * Rate limit configurations for different endpoints
 */
export const RATE_LIMITS = {
  // Video analysis is expensive, so stricter limits
  videoAnalyze: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 10, // 10 videos per hour
  },
  // Questions are less expensive
  videoQuestion: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 50, // 50 questions per hour
  },
  // Transcript generation is expensive
  videoTranscript: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 20, // 20 transcripts per hour
  },
  // Summarization is expensive
  transcriptSummarize: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 30, // 30 summaries per hour
  },
  // History endpoints are lightweight
  history: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 60, // 60 requests per minute
  },
  // Auth endpoints
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 10, // 10 auth attempts per 15 minutes
  },
} as const;


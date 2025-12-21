import { NextRequest, NextResponse } from "next/server";
import {
  checkRateLimit,
  getClientIdentifier,
  getIpAddress,
  type RateLimitConfig,
} from "@/lib/rateLimit";
import { createClient } from "@/lib/supabase/server";

/**
 * Rate limit middleware for API routes
 * Returns null if rate limit passed, or a Response if rate limit exceeded
 */
export async function withRateLimit(
  request: NextRequest,
  config: RateLimitConfig,
  endpoint: string
): Promise<NextResponse | null> {
  try {
    // Get user ID if authenticated
    let userId: string | null = null;
    try {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      userId = user?.id || null;
    } catch {
      // If auth check fails, continue with IP-based rate limiting
    }

    // Get IP address
    const ipAddress = getIpAddress(request);

    // Get client identifier
    const identifier = getClientIdentifier(userId, ipAddress);

    // Check rate limit
    const result = checkRateLimit(identifier, config);

    if (!result.success) {
      const resetDate = new Date(result.reset);
      const retryAfter = Math.ceil((result.reset - Date.now()) / 1000);

      return NextResponse.json(
        {
          error: "Rate limit exceeded",
          message: `Too many requests. Please try again after ${resetDate.toISOString()}.`,
          retryAfter,
          limit: result.limit,
          reset: result.reset,
        },
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "X-RateLimit-Limit": result.limit.toString(),
            "X-RateLimit-Remaining": result.remaining.toString(),
            "X-RateLimit-Reset": result.reset.toString(),
            "Retry-After": retryAfter.toString(),
          },
        }
      );
    }

    // Add rate limit headers to successful response
    // (We'll need to add these manually in each route handler)
    return null;
  } catch (error) {
    // If rate limiting fails, log but don't block the request
    // eslint-disable-next-line no-console
    console.error(`[Rate Limit Error] ${endpoint}:`, error);
    return null;
  }
}

/**
 * Helper to add rate limit headers to response
 */
export function addRateLimitHeaders(
  response: NextResponse,
  limit: number,
  remaining: number,
  reset: number
): NextResponse {
  response.headers.set("X-RateLimit-Limit", limit.toString());
  response.headers.set("X-RateLimit-Remaining", remaining.toString());
  response.headers.set("X-RateLimit-Reset", reset.toString());
  return response;
}


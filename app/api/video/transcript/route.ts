import { NextRequest, NextResponse } from "next/server";
import { getTranscript } from "@/lib/geminiClient";
import { createErrorResponse } from "@/app/api/utils/errorResponse";
import { createClient } from "@/lib/supabase/server";
import { addRateLimitHeaders } from "@/app/api/utils/rateLimit";
import { RATE_LIMITS } from "@/lib/rateLimit";
import {
  checkRateLimit,
  getClientIdentifier,
  getIpAddress,
} from "@/lib/rateLimit";

export async function POST(request: NextRequest) {
  try {
    // Authentication is optional - allow guest mode
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    // Check rate limit (works for both authenticated and guest users)
    const ipAddress = getIpAddress(request);
    const identifier = getClientIdentifier(user?.id || null, ipAddress);
    const rateLimitResult = checkRateLimit(
      identifier,
      RATE_LIMITS.videoTranscript
    );

    if (!rateLimitResult.success) {
      const retryAfter = Math.ceil(
        (rateLimitResult.reset - Date.now()) / 1000
      );
      return NextResponse.json(
        {
          error: "Rate limit exceeded",
          message: `You've reached the limit of ${RATE_LIMITS.videoTranscript.maxRequests} transcript requests per hour. Please try again later.`,
          retryAfter,
          limit: rateLimitResult.limit,
          reset: rateLimitResult.reset,
        },
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "X-RateLimit-Limit": rateLimitResult.limit.toString(),
            "X-RateLimit-Remaining": rateLimitResult.remaining.toString(),
            "X-RateLimit-Reset": rateLimitResult.reset.toString(),
            "Retry-After": retryAfter.toString(),
          },
        }
      );
    }

    const body = await request.json();
    const videoSource = body.videoSource as string | undefined;

    if (!videoSource || typeof videoSource !== "string") {
      return createErrorResponse(
        new Error("Missing or invalid 'videoSource'."),
        "Invalid request body.",
        { status: 400, context: "/api/video/transcript" },
      );
    }

    const transcript = await getTranscript(videoSource);

    const response = new NextResponse(JSON.stringify({ transcript }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

    // Add rate limit headers
    return addRateLimitHeaders(
      response,
      rateLimitResult.limit,
      rateLimitResult.remaining,
      rateLimitResult.reset
    );
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("[/api/video/transcript] Error:", error);
    return createErrorResponse(
      error,
      "Failed to generate transcript.",
      { status: 500, context: "/api/video/transcript" },
    );
  }
}
